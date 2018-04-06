// tslint:disable:no-implicit-dependencies

import express from 'express';
import getPort from 'get-port';
import { createApiRouter, CreateApiOptions } from '../createApiServer';
import { GraphQLClient } from '@forabi/graphql-request';
import { createConnection } from 'typeorm';
import { entities } from '../database/entities';
import faker from 'faker';
import { Server } from 'http';
import { Options } from '@forabi/graphql-request/dist/src/types';
import { AuthProvider } from '../authProvider/types';
import { User } from '../database/entities/User';

export class FakeAuthProvider implements AuthProvider {
  findUserByToken = async (): Promise<User | undefined> => undefined;

  getProfileDetailsByToken = async () => ({
    id: faker.internet.userName(),
    name: faker.name.firstName(),
  });

  getPhotoUrlByUserId = async () => faker.internet.url();
}

type CreateTestContextOptions = {
  createApiRouterOptions?: Partial<CreateApiOptions>;
  graphqlClientOptions?: Options;
};

export const createTestContext = async ({
  createApiRouterOptions = {},
  graphqlClientOptions,
}: CreateTestContextOptions = {}) => {
  const [serverPort, connection] = await Promise.all([
    getPort(),
    (async () => {
      if (!createApiRouterOptions.connection) {
        return createConnection({
          type: 'mysql',
          host: process.env.CI ? 'database' : 'localhost',
          username: 'root',
          password: '123456',
          port: 3306,
          database: 'test-db',
          synchronize: true,
          dropSchema: true,
          entities,
        });
      }

      return createApiRouterOptions.connection;
    })(),
  ]);

  const app = express();
  const router = createApiRouter({
    connection,
    authProvider: new FakeAuthProvider(),
    ...createApiRouterOptions,
  });

  app.use('/graphql', router);

  let server: Server;

  await new Promise(resolve => {
    server = app.listen(serverPort, resolve);
  });

  // tslint:disable-next-line:no-http-string
  const apiEndpoint = `http://localhost:${serverPort}/graphql`;

  const client = new GraphQLClient(apiEndpoint, graphqlClientOptions);

  const teardown = async () => {
    await Promise.all([
      connection.dropDatabase().then(async () => connection.close()),
      new Promise(resolve => {
        server.close(resolve);
      }),
    ]);
  };

  return { client, connection, teardown };
};

type UnPromisify<T> = T extends Promise<infer R> ? R : T;

export type TestContext = UnPromisify<ReturnType<typeof createTestContext>>;
