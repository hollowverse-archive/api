import { ApiError } from '../../helpers/apiError';
import { DirectiveResolverMap } from '../../typings/resolverMap';

export const resolvers: Pick<DirectiveResolverMap, 'requireRoles'> = {
  async requireRoles(next, _source, _args, context) {
    if (context.viewer && context.viewer.email === 'editor@hollowverse.com') {
      return next();
    } else {
      throw new ApiError('MustBeAuthorizedError');
    }
  },
};
