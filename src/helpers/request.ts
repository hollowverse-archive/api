import * as got from 'got';

class InvalidAccessTokenError extends Error {
  name = 'InvalidAccessTokenError';
}

export async function sendRequest(url: string, options: got.GotJSONOptions) {
  try {
    return await got(url, options);
  } catch (error) {
    const e = error as got.GotError;
    if (e.name === 'HTTPError') {
      const { statusCode } = e;
      if (statusCode >= 400 && statusCode < 500) {
        throw new InvalidAccessTokenError();
      }
    }
    throw error;
  }
}
