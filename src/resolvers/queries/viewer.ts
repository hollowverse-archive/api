import { connection } from '../../database/connection';
import { User } from '../../database/entities/user';
import { ViewerRootQueryArgs } from '../../typings/schema';
import { sendRequest } from '../../helpers/request';

export async function viewer(
  _: undefined,
  { fbAccessToken }: ViewerRootQueryArgs,
) {
  // Get Facebook profile ID using the access token
  const response = await sendRequest('https://graph.facebook.com/me', {
    query: {
      access_token: fbAccessToken,
      fields: 'id',
    },
    json: true,
  });

  const fbId: string | undefined = response.body.id;

  if (fbId) {
    const db = await connection;
    const users = db.getRepository(User);

    return users.findOne({ where: { fbId } });
  }

  return undefined;
}
