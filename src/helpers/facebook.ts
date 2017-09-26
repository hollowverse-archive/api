import * as got from 'got';
import { readJson } from './readJson';

const facebookAppConfig = readJson<FacebookAppConfig>(
  'secrets/facebookApp.json',
);

/**
 * A custom `Error` thrown when attempting to authenticate with Facebook.
 * 
 * The `name` property is shown in the query result to help diagnose issues with
 * the query.
 */
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
async function verifyFacebookAccessToken(token: string) {
  const app = await facebookAppConfig;
  const response = await got('https://graph.facebook.com/debug_token', {
    query: {
      access_token: app.accessToken,
      input_token: token,
    },
    json: true,
  });

  if (response.body.data) {
    const { app_id, is_valid } = response.body.data;
    if (is_valid === true && app_id === app.id) {
      return;
    }
  }

  throw new InvalidAccessTokenError();
}

/**
 * Send an authenticated request to Facebook API with an access token.
 * The access token is verified before the request is attempted.
 * If the access token is not valid, or if it was not issued for the Hollowverse app,
 * an `InvalidAccessTokenError` is thrown.
 * 
 * Note: if `options.query` is a string, the access token is not added automatically
 * to the request.
 */
export async function sendFacebookAuthenticatedRequest(
  accessToken: string,
  url: string,
  options: got.GotJSONOptions,
) {
  await verifyFacebookAccessToken(accessToken);

  return got(url, {
    ...options,
    query:
      typeof options.query !== 'string'
        ? {
            access_token: accessToken,
            ...options.query,
          }
        : options.query,
  });
}