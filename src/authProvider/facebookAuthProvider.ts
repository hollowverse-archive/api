import { AuthProvider, PhotoSize } from './types';
import got from 'got';
import { ApiError } from '../helpers/apiError';
import { User } from '../database/entities/User';
import { Connection } from 'typeorm';

export class FacebookAuthProvider implements AuthProvider {
  private appAccessToken: string;
  private appId: string;
  private connection: Connection;

  constructor(connection: Connection, facebookSecrets: FacebookAppConfig) {
    this.connection = connection;
    this.appAccessToken = facebookSecrets.accessToken;
    this.appId = facebookSecrets.id;
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
  async verifyFacebookAccessToken(token: string) {
    if (!token) {
      throw new ApiError('InvalidAccessTokenError');
    }

    // tslint:disable-next-line await-promise
    const response = await got('https://graph.facebook.com/debug_token', {
      query: {
        access_token: this.appAccessToken,
        input_token: token,
      },
      json: true,
    });

    if (response.body.data) {
      const { app_id, is_valid } = response.body.data;
      if (is_valid === true && app_id === this.appId) {
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
  async sendFacebookAuthenticatedRequest(
    accessToken: string,
    url: string,
    options: got.GotJSONOptions,
  ) {
    await this.verifyFacebookAccessToken(accessToken);

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

  async getPhotoUrlByUserId(id: string, type: PhotoSize) {
    const response = await got(`https://graph.facebook.com/${id}/picture`, {
      json: true,
      query: {
        type: type,
        redirect: false,
      },
    });

    return response.body.data.url as string;
  }

  async getProfileDetailsByToken(token: string) {
    const response = await this.sendFacebookAuthenticatedRequest(
      token,
      'https://graph.facebook.com/me',
      {
        query: {
          fields: ['id', 'name', 'picture'].join(','),
        },
        json: true,
      },
    );

    return response.body;
  }

  async findUserByToken(fbAccessToken: string) {
    // Get Facebook profile ID using the access token
    const response = await this.sendFacebookAuthenticatedRequest(
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
      const users = this.connection.getRepository(User);

      return users.findOne({ where: { fbId } });
    }

    return undefined;
  }
}
