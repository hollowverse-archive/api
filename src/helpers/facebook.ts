import * as got from 'got';
import { readJson } from './readFile';
import { ApiError } from './apiError';

const facebookAppConfig = readJson<FacebookAppConfig>(
  'secrets/facebookApp.json',
);

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
  if (!token) {
    throw new ApiError('InvalidAccessTokenError');
  }

  const app = await facebookAppConfig;
  // tslint:disable-next-line await-promise
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

  throw new ApiError('InvalidAccessTokenError');
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

export async function getPhotoUrlByFbId(
  fbId: string,
  type: 'small' | 'normal' | 'large' = 'normal',
) {
  const response = await got(`https://graph.facebook.com/${fbId}/picture`, {
    json: true,
    query: {
      type: type,
      redirect: false,
    },
  });

  return response.body.data.url;
}
