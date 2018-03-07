import { makeExecutableSchema } from 'graphql-tools';
import { readFile } from './helpers/readFile';

import { resolvers } from './resolvers/resolvers';
import { ApiError } from './helpers/apiError';

export const schema = readFile('schema.graphql', 'utf8').then(typeDefs =>
  makeExecutableSchema({
    typeDefs,
    resolvers: resolvers as any,
    directiveResolvers: {
      async requireAuth(next, _source, _args, context) {
        if (context.viewer) {
          return next();
        } else {
          throw new ApiError('MustBeAuthorizedError');
        }
      },
      async requireRoles(_next, _source, _args, _context) {
        // @TODO: implement this
        throw new ApiError('MustBeAuthorizedError');
      },
    },
  }),
);
