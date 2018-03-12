import { ApiError } from '../../helpers/apiError';
import { DirectiveResolverFn } from 'graphql-tools/dist/Interfaces';
import { SchemaContext } from '../../typings/schemaContext';

export const requireAuth: DirectiveResolverFn<any, SchemaContext> = async (
  next,
  _source,
  _args,
  context,
) => {
  if (context.viewer) {
    return next();
  } else {
    throw new ApiError('MustBeAuthorizedError');
  }
};
