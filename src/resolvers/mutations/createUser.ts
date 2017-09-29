import { connection } from '../../database/connection';
import { User } from '../../database/entities/user';
import { CreateUserRootMutationArgs, RootMutation } from '../../typings/schema';
import { sendFacebookAuthenticatedRequest } from '../../helpers/facebook';
import { SchemaContext } from '../../typings/schemaContext';

/** Thrown when attempting to sign up while already logged in */
class AlreadyRegisteredError extends Error {
  name = 'ALREADY_REGISTERED';
}

/**
 * Create a new user passing using a valid Facebook access token
 * issued for the Hollowverse application.
 * 
 * The name and email of the new user will be obtained from Facebook if
 * not specified in the mutation input.
 */
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
  user.email = email;

  user.signedUpAt = new Date();

  const users = db.getRepository(User);

  return users.persist(user);
}
