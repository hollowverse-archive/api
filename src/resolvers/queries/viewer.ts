import { connection } from '../../database/connection';
import { User } from '../../database/entities/user';
import { ViewerRootQueryArgs } from '../../typings/schema';
import { sendFacebookAuthenticatedRequest } from '../../helpers/facebook';

export async function viewer(
  _: undefined,
  { fbAccessToken }: ViewerRootQueryArgs,
) {
  // Get Facebook profile ID using the access token
  const response = await sendFacebookAuthenticatedRequest(
    fbAccessToken,
    'https://graph.facebook.com/me',
    {
      query: {
        fields: 'id',
      },
      json: true,
    },
  );

  const fbId: string | undefined = response.body.id;

  if (fbId) {
    const db = await connection;
    const users = db.getRepository(User);

    return users.findOne({ where: { fbId } });
  }

  return undefined;
}
