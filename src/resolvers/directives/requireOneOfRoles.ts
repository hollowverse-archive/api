import { DirectiveResolverMap } from '../../typings/resolverMap';
import { oneLine } from 'common-tags';
import { ApiError } from '../../helpers/apiError';

export const resolvers: Pick<DirectiveResolverMap, 'requireOneOfRoles'> = {
  async requireOneOfRoles(next, _source, { roles }, { viewer }) {
    if (!viewer) {
      throw new ApiError('MustBeAuthorizedError');
    }

    if (viewer.role && roles.includes(viewer.role)) {
      return next();
    }

    let errorMessage: string;
    if (roles.length === 1) {
      errorMessage = `Only users with an "${
        roles[0]
      }" role can perform this query`;
    } else {
      errorMessage = oneLine`
        Only users with one of the following
        roles are allowed to perform this operation: ${roles.join(',')}
      `;
    }

    throw new ApiError('RoleMismatchError', errorMessage);
  },
};
