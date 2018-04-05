// tslint:disable:no-implicit-dependencies

import express from 'express';
import getPort from 'get-port';
import { createApiRouter, CreateApiOptions } from '../createApiServer';
import { GraphQLClient } from '@forabi/graphql-request';
import { createConnection } from 'typeorm';
import { entities } from '../database/connection';

type CreateTestContextOptions = {
  createApiRouterOptions?: Partial<CreateApiOptions>;
};

export const createTestContext = async ({
  createApiRouterOptions,
}: CreateTestContextOptions = {}) => {
  const serverPort = await getPort();

  const app = express();
  const router = createApiRouter({
    findUserByToken: async () => undefined,
    connection: await createConnection({
      type: 'sqlite',
      database: ':memory:',
      entities,
    }),
    ...createApiRouterOptions,
  });

  app.use('/graphql', router);

  await new Promise(resolve => app.listen(serverPort, resolve));

  // tslint:disable-next-line:no-http-string
  const apiEndpoint = `http://localhost:${serverPort}/graphql'`;

  const makeRequest = async <T>(
    query: string,
    variables?: Record<string, any>,
    options = {},
  ) => {
    const client = new GraphQLClient(apiEndpoint, options);

    return client.request<T>(query, variables);
  };

  return { makeRequest };
};

type UnPromisify<T> = T extends Promise<infer R> ? R : T;

export type TestContext = UnPromisify<ReturnType<typeof createTestContext>>;
