import { sendAuthenticatedRequest } from './request';
import { readJson } from './readJson';

const facebookApp = readJson<FacebookAppConfig>('secrets/facebookApp.json');

class InvalidAccessTokenError extends Error {
  name = 'InvalidAccessTokenError';
}

/**
 * Verifies that a received Facebook access token is issued for the Hollowverse
 * Facebook app. While it is not possible for an attacker to impersonate a user
 * with a valid access token issued for another user, it is still possible for another
 * app authorized by the user to use its access token to sign up that user to Hollowverse
 * without their consent, or worse steal their data.
 * This verification step prevents that scenario by confirming with Facebook that
 * the access token was actually issued for the Hollowverse application.
 * 
 * @see https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow#checktoken
 */
export async function verifyFacebookAccessToken(token: string) {
  const app = await facebookApp;
  const response = await sendAuthenticatedRequest(
    'https://graph.facebook.com/debug_token',
    {
      query: {
        access_token: app.accessToken,
        input_token: token,
      },
      json: true,
    },
  );

  if (response.body.data) {
    const { app_id, is_valid } = response.body.data;
    if (is_valid === true && app_id === app.id) {
      return;
    }
  }

  throw new InvalidAccessTokenError();
}
