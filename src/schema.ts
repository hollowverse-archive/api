import { makeExecutableSchema } from 'graphql-tools';
import * as fs from 'fs';
import * as path from 'path';

import { resolvers } from './resolvers/resolvers';

const typeDefs = fs.readFileSync(
  path.resolve(__dirname, './schema.graphql'),
  'utf8',
);

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
