import { ApiError } from '../../helpers/apiError';
import { DirectiveResolverMap } from '../../typings/resolverMap';

export const resolvers: Pick<DirectiveResolverMap, 'requireAuth'> = {
  async requireAuth(next, _source, _args, context) {
    if (context.viewer) {
      return next();
    }

    throw new ApiError('NOT_AUTHENTICATED');
  },
};
