import { connection } from '../../database/connection';
import { User } from '../../database/entities/user';
import { CreateUserRootMutationArgs, RootMutation } from '../../typings/schema';
import { sendFacebookAuthenticatedRequest } from '../../helpers/facebook';
import { SchemaContext } from '../../typings/schemaContext';

/** Thrown when attempting to sign up while already logged in */
class AlreadyRegisteredError extends Error {
  name = 'ALREADY_REGISTERED';
}

export async function createUser(
  _: undefined,
  { data: { fbAccessToken, email, name } }: CreateUserRootMutationArgs,
  context: SchemaContext,
): Promise<RootMutation['createUser']> {
  if (context.viewer) {
    throw new AlreadyRegisteredError();
  }

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
