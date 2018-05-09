import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import moment from 'moment';
import playgroundExpress from 'graphql-playground-middleware-express';
import { readAwsSecretStringForStage } from '@hollowverse/utils/helpers/readAwsSecretStringForStage';

import { connectionPromise } from './database/connection';
import { isProd } from '@hollowverse/utils/helpers/env';
import { createApiRouter } from './createApiServer';
import { FacebookAuthProvider } from './authProvider/facebookAuthProvider';

export const createApiServer = async () => {
  const api = express();
  const facebookAppConfig: Promise<
    FacebookAppConfig | undefined
  > = readAwsSecretStringForStage('facebookApp').then(
    secretString =>
      secretString !== undefined ? JSON.parse(secretString) : undefined,
  );

  api.use(
    cors({
      origin: isProd ? ['https://hollowverse.com', /\.hollowverse\.com$/] : '*',
    }),
  );

  api.use(
    helmet({
      hsts: {
        // Enable HTTP Strict Transport Security
        // This tells the browser to rewrite all subsequent http:// URLs to
        // https:// so that we can skip the redirection request overhead.
        maxAge: moment.duration(60, 'days').asSeconds(),
        includeSubdomains: true,
        preload: true,
      },
      hidePoweredBy: true,
      noSniff: true,
      ieNoOpen: true,
      xssFilter: true,
      frameguard: true,
    }),
  );

  api.use(
    helmet.referrerPolicy({
      // Tells browsers that support the `Referrer-Policy` header to only send
      // the `Referer` header when navigating to a secure origin.
      // If the destination origin is different from the website's origin, the full URL
      // is stripped so that it only contains the domain name.
      // See https://www.w3.org/TR/referrer-policy/#referrer-policy-strict-origin-when-cross-origin
      policy: 'strict-origin-when-cross-origin',
    }),
  );

  const playground = playgroundExpress({
    endpoint: '/graphql',
  });

  api.get('/playground', playground);
  api.get('/', playground);

  const connection = await connectionPromise;

  api.use(
    '/graphql',
    createApiRouter({
      connection,
      authProvider: new FacebookAuthProvider(
        connection,
        await facebookAppConfig,
      ),
    }),
  );

  return api;
};
