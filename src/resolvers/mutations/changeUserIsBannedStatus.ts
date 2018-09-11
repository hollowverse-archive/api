import { User } from '../../database/entities/User';
import { ApiError } from '../../helpers/apiError';
import { makeErrorResult, makeSuccessResult } from '../../helpers/makeResult';
import { canUserWithRoleXMutateUserWithRoleY } from '../../helpers/permissions';
import { ResolverMap } from '../../typings/resolverMap';

export const resolvers: Partial<ResolverMap> = {
  RootMutation: {
    async changeUserIsBannedStatus(
      _,
      { input: { userId, newValue } },
      { connection, viewer },
    ) {
      if (!viewer) {
        // This is a server error. `viewer` should have been checked by `requireOneOfRoles`.
        throw new ApiError('INTERNAL', 'Expected `viewer` to be defined');
      }

      const users = connection.getRepository(User);

      const user = await users.findOneById(userId);

      if (!user) {
        return {
          result: makeErrorResult(
            'BAD_REQUEST',
            'Could not find user with the specified ID',
          ),
        };
      }

      if (user.id === viewer.id) {
        return {
          result: makeErrorResult(
            'BAD_REQUEST',
            'Cannot change ban status of oneself',
          ),
        };
      }

      const canViewerBanUser = canUserWithRoleXMutateUserWithRoleY({
        roleX: viewer.role,
        roleY: user.role,
        mutation: 'changeUserIsBannedStatus',
      });

      if (!canViewerBanUser) {
        return {
          result: makeErrorResult(
            'NOT_AUTHORIZED',
            `A user with role "${
              viewer.role
            }" cannot change the ban status of a user with ${
              user.role === null ? 'no role' : `role "${user.role}"`
            }`,
          ),
        };
      }

      if (user.isBanned === newValue) {
        return {
          result: makeErrorResult(
            'BAD_REQUEST',
            user.isBanned
              ? 'User is already banned'
              : 'User is already not banned',
          ),
        };
      }

      user.isBanned = newValue;

      await users.save(user);

      return {
        result: makeSuccessResult(),
      };
    },
  },
};
