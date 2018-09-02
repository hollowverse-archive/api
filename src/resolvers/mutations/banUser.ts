import { User } from '../../database/entities/User';
import { ResolverMap } from '../../typings/resolverMap';
import { makeErrorResult, makeSuccessResult } from '../../helpers/makeResult';
import { canUserWithRoleXMutateUserWithRoleY } from '../../helpers/permissions';

export const resolvers: Partial<ResolverMap> = {
  RootMutation: {
    async banUser(_, { input: { userId } }, { connection, viewer }) {
      if (!viewer) {
        // This is a server error. `viewer` should have been checked by `requireOneOfRoles`.
        throw new TypeError('Expected `viewer` to be defined in `banUser`');
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

      const canViewerBanUser = canUserWithRoleXMutateUserWithRoleY({
        roleX: viewer.role,
        roleY: user.role,
        mutation: 'banUser',
      });

      if (!canViewerBanUser) {
        return {
          result: makeErrorResult(
            'NOT_AUTHORIZED',
            `A user with role ${viewer.role} cannot ban a user with ${
              user.role === null ? 'no role' : `role ${user.role}`
            }`,
          ),
        };
      }

      user.isBanned = true;

      await users.save(user);

      return {
        result: makeSuccessResult(),
      };
    },
  },
};