import { ApiError } from '../../helpers/apiError';
import { DirectiveResolverMap } from '../../typings/resolverMap';

export const resolvers: Pick<DirectiveResolverMap, 'requireAuth'> = {
  async requireAuth(next, _source, { allowBanned }, context, { parentType }) {
    if (context.viewer) {
      // Prevent banned users from performing any mutations
      if (
        context.viewer.isBanned === true &&
        Boolean(allowBanned) === false &&
        parentType.name.endsWith('Mutation')
      ) {
        throw new ApiError('BANNED');
      }

      return next();
    }

    throw new ApiError('NOT_AUTHENTICATED');
  },
};
