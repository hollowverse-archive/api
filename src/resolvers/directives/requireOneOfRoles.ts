import { DirectiveResolverMap } from '../../typings/resolverMap';
import { oneLine } from 'common-tags';
import { ApiError } from '../../helpers/apiError';

export const resolvers: Pick<DirectiveResolverMap, 'requireOneOfRoles'> = {
  async requireOneOfRoles(next, _source, { roles }, { viewer }) {
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
  },
};
