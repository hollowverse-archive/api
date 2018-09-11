import { User } from '../../database/entities/User';
import { ApiError } from '../../helpers/apiError';
import { ResolverMap } from '../../typings/resolverMap';

export const resolvers: Partial<ResolverMap> = {
  RootMutation: {
    /**
     * Create a new user using a valid Facebook access token
     * issued for the Hollowverse application.
     *
     * The name of the new user will be obtained from Facebook if
     * not specified in the mutation input.
     */
    async createUser(
      _,
      { input: { fbAccessToken, email, name } },
      { connection, viewer, authProvider },
    ) {
      if (viewer) {
        throw new ApiError(
          'OPERATION_NOT_ALLOWED',
          'Cannot create a new user because the request is already authenticated',
        );
      }

      const profile = await authProvider.getProfileDetailsByToken(
        fbAccessToken,
      );
      const user = new User();

      user.fbId = profile.id;
      user.name = name || profile.name;
      user.email = email || null;

      user.signedUpAt = new Date();

      const users = connection.getRepository(User);

      return users.save(user);
    },
  },
};
