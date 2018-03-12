import { ApiError } from '../../helpers/apiError';
import { DirectiveResolverFn } from 'graphql-tools/dist/Interfaces';
import { SchemaContext } from '../../typings/schemaContext';

export const requireRoles: DirectiveResolverFn<any, SchemaContext> = async (
  next,
  _source,
  _args,
  context,
) => {
  if (context.viewer && context.viewer.email === 'editor@hollowverse.com') {
    return next();
  } else {
    throw new ApiError('MustBeAuthorizedError');
  }
};
