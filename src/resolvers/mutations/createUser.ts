import { connection } from '../../database/connection';
import { User } from '../../database/entities/user';
import { CreateUserRootMutationArgs, RootMutation } from '../../typings/schema';
import { sendFacebookAuthenticatedRequest } from '../../helpers/facebook';

export async function createUser(
  _: undefined,
  { data: { fbAccessToken, email, name } }: CreateUserRootMutationArgs,
): Promise<RootMutation['createUser']> {
  type Profile = {
    id: string;
    name: string;
    email: string;
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
        fields: ['id', 'name', 'email', 'picture'].join(','),
      },
      json: true,
    },
  );

  const profile: Profile = response.body;

  const db = await connection;
  const user = new User();

  user.fbId = profile.id;
  user.name = name || profile.name;
  user.email = email || profile.email;

  user.signedUpAt = new Date();

  const users = db.getRepository(User);

  return users.persist(user);
}
