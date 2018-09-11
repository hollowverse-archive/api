import { oneLine } from 'common-tags';
import { ApiError } from '../../helpers/apiError';
import { DirectiveResolverMap } from '../../typings/resolverMap';
import { resolvers as requireAuthResolvers } from './requireAuth';

const { requireAuth } = requireAuthResolvers;

export const resolvers: Pick<DirectiveResolverMap, 'requireOneOfRoles'> = {
  requireOneOfRoles: async (next, source, { roles }, context, info) => {
    const checkForMatchingRoles = async () => {
      const { viewer } = context;
      if (!viewer) {
        throw new ApiError('NOT_AUTHENTICATED');
      }

      if (viewer.role === null) {
        throw new ApiError('NOT_AUTHORIZED');
      }

      if (viewer.role && roles.includes(viewer.role)) {
        return next();
      }

      let errorMessage: string;
      if (roles.length === 1) {
        errorMessage = `Only users with an "${
          roles[0]
        }" role can perform this operation`;
      } else {
        errorMessage = oneLine`
          Only users with one of the following
          roles are allowed to perform this operation: ${roles.join(', ')}
        `;
      }

      throw new ApiError('ROLE_MISMATCH', errorMessage);
    };

    // First check that the user is authenticated and not banned
    return requireAuth(
      // Next, check for matching roles
      checkForMatchingRoles,
      source,
      { allowBanned: false },
      context,
      info,
    );
  },
};
