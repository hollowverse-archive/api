import { ViewerRootQueryArgs } from '../../typings/schema';
import { findUserByFacebookAccessToken } from '../../helpers/auth';

export async function viewer(
  _: undefined,
  { fbAccessToken }: ViewerRootQueryArgs,
) {
  return findUserByFacebookAccessToken(fbAccessToken);
}
