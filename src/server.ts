import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import moment from 'moment';
import playgroundExpress from 'graphql-playground-middleware-express';

import { redirectToHttps } from './redirectToHttps';
import { connectionPromise } from './database/connection';
import { isProd } from './env';
import { createApiRouter } from './createApiServer';
import { FacebookAuthProvider } from './authProvider/facebookAuthProvider';
import { readJson } from './helpers/readFile';

export const createApiServer = async () => {
  const api = express();

  api.use(
    cors({
      origin: isProd ? ['https://hollowverse.com', /\.hollowverse\.com$/] : '*',
    }),
  );

  api.use(redirectToHttps);

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
  const facebookAppConfig = await readJson<FacebookAppConfig>(
    'secrets/facebookApp.json',
  );

  api.use(
    '/graphql',
    createApiRouter({
      connection,
      authProvider: new FacebookAuthProvider(connection, facebookAppConfig),
    }),
  );

  return api;
};
