import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import moment from 'moment';
import playgroundExpress from 'graphql-playground-middleware-express';
import loggy from 'loggy';

import { redirectToHttps } from './redirectToHttps';
import { health, setIsHealthy } from './health';
import { findUserByFacebookAccessToken } from './helpers/auth';
import { connectionPromise } from './database/connection';
import { isProd } from './env';
import { createApiRouter } from './createApiServer';
import { sendFacebookAuthenticatedRequest } from './helpers/facebook';

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

api.use('/', health);

api.get(
  '/playground',
  playgroundExpress({
    endpoint: '/graphql',
  }),
);

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  const connection = await connectionPromise;

  api.use(
    '/graphql',
    createApiRouter({
      connection,
      findUserByToken: findUserByFacebookAccessToken,
      getProfileDetailsFromAuthProvider: async token => {
        const response = await sendFacebookAuthenticatedRequest(
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
      },
    }),
  );

  const server = api.listen(PORT, () => {
    loggy.info(`API server started on http://localhost:${PORT}`);
    loggy.info(
      `API playground accessible on http://localhost:${PORT}/playground`,
    );
    loggy.info(`API endpoint accessible on http://localhost:${PORT}/graphql`);
  });

  const close = () => {
    server.close();
    process.exit();
  };

  process.on('SIGUSR2', close);
  process.on('SIGUSR1', close);
};

startServer().catch(e => {
  loggy.error('Failed to start API server: ', e);
  setIsHealthy(false);
});
