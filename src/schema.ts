import { makeExecutableSchema } from 'graphql-tools';
import { readFile } from './helpers/readFile';

import { resolvers } from './resolvers/resolvers';

export const schema = readFile('schema.graphql', 'utf8').then(typeDefs =>
  makeExecutableSchema({
    typeDefs,
    resolvers: resolvers as any,
  }),
);
