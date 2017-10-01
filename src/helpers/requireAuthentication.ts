import { SchemaContext } from '../typings/schemaContext';
import { ApiError } from './apiError';
import { GraphQLFieldResolver, GraphQLResolveInfo } from 'graphql/type';

/**
 * A higher-order function that wraps a GraphQL resolver and checks
 * if the request is authenticated before calling the wrapped resolver.
 * 
 * If the request is not authenticated, an instance of `MustBeAuthorizedError` is thrown.
 */
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
      throw new ApiError('MustBeAuthorizedError');
    }
  };
}
