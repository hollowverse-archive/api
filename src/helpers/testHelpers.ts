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

type CreateTestContextOptions = {
  createApiRouterOptions?: Partial<CreateApiOptions>;
  graphqlClientOptions?: Options;
};

export const createTestContext = async ({
  createApiRouterOptions,
  graphqlClientOptions,
}: CreateTestContextOptions = {}) => {
  const [serverPort, connection] = await Promise.all([
    getPort(),
    createConnection({
      type: 'mysql',
      host: process.env.CI ? 'database' : 'localhost',
      username: 'root',
      password: '123456',
      port: 3306,
      database: 'test-db',
      synchronize: true,
      dropSchema: true,
      entities,
    }),
  ]);

  const app = express();
  const router = createApiRouter({
    findUserByToken: async () => undefined,
    getProfileDetailsFromAuthProvider: async () => ({
      id: faker.internet.userName(),
      name: faker.name.firstName(),
    }),
    getPhotoUrlFromAuthProvider: async () => faker.internet.url(),
    connection,
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

  const makeRequest = async <T>(
    query: string,
    variables?: Record<string, any>,
  ) => {
    return client.request<T>(query, variables);
  };

  const teardown = async () => {
    await Promise.all([
      connection.dropDatabase().then(() => connection.close()),
      new Promise(resolve => {
        server.close(resolve);
      }),
    ]);
  };

  return { makeRequest, client, teardown };
};

type UnPromisify<T> = T extends Promise<infer R> ? R : T;

export type TestContext = UnPromisify<ReturnType<typeof createTestContext>>;
