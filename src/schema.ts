import { makeExecutableSchema } from 'graphql-tools';
import { readFile } from './helpers/readFile';
import path from 'path';

import { resolvers, directiveResolvers } from './resolvers/resolvers';

export const schema = readFile(
  path.join(__dirname, 'schema.graphql'),
  'utf8',
).then(typeDefs =>
  makeExecutableSchema({
    typeDefs,
    resolvers: resolvers as any,
    directiveResolvers: directiveResolvers as any,
  }),
);
