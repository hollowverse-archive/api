import { SchemaContext } from '../typings/schemaContext';
import { ApiError } from './apiError';
import { GraphQLFieldResolver, GraphQLResolveInfo } from 'graphql/type';

export function requireAuthentication<S, A>(
  resolver: GraphQLFieldResolver<S, SchemaContext>,
) {
  return (
    source: S,
    args: A,
    context: SchemaContext,
    info: GraphQLResolveInfo,
  ) => {
    if (context.viewer) {
      return resolver(source, args, context, info);
    } else {
      console.error('Not authorized');
      throw new ApiError('MustBeAuthorizedError');
    }
  };
}
