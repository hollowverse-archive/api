import { connection } from '../../database/connection';
import { User } from '../../database/entities/User';
import { sendFacebookAuthenticatedRequest } from '../../helpers/facebook';
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
    async createUser(_, { input: { fbAccessToken, email, name } }, context) {
      if (context.viewer) {
        throw new ApiError(
          'OperationNotAllowedError',
          'Cannot create a new user because the request is already authenticated',
        );
      }

      type Profile = {
        id: string;
        name: string;
        picture: {
          data: {
            is_silhouette: boolean;
            url: string;
          };
        };
      };

      const response = await sendFacebookAuthenticatedRequest(
        fbAccessToken,
        'https://graph.facebook.com/me',
        {
          query: {
            fields: ['id', 'name', 'picture'].join(','),
          },
          json: true,
        },
      );

      const profile: Profile = response.body;

      const db = await connection;
      const user = new User();

      user.fbId = profile.id;
      user.name = name || profile.name;
      user.email = email || null;

      user.signedUpAt = new Date();

      const users = db.getRepository(User);

      return users.save(user);
    },
  },
};
