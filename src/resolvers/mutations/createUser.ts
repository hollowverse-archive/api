import { connection } from '../../database/connection';
import { User } from '../../database/entities/user';
import { CreateUserRootMutationArgs, RootMutation } from '../../typings/schema';
import { sendRequest } from '../../helpers/request';

export async function createUser(
  _: undefined,
  { data: { fbAccessToken } }: CreateUserRootMutationArgs,
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

  const response = await sendRequest('https://graph.facebook.com/me', {
    query: {
      access_token: fbAccessToken,
      fields: ['id', 'name', 'email', 'picture'].join(','),
    },
    json: true,
  });

  const profile: Profile = response.body;

  const db = await connection;
  const user = new User();

  user.fbId = profile.id;
  user.name = profile.name;
  user.email = profile.email;

  user.signedUpAt = new Date();

  const users = db.getRepository(User);

  return users.persist(user);
}
