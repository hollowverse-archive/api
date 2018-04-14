import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import moment from 'moment';
import playgroundExpress from 'graphql-playground-middleware-express';
import loggy from 'loggy';

import { redirectToHttps } from './redirectToHttps';
import { health, setIsHealthy } from './health';
import { connectionPromise } from './database/connection';
import { isProd } from './env';
import { createApiRouter } from './createApiServer';
import { FacebookAuthProvider } from './authProvider/facebookAuthProvider';
import { readJson } from './helpers/readFile';
import { stripIndent } from 'common-tags';

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

api.use('/health', health);

const PORT = process.env.PORT || 8080;

const startServer = async () => {
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

  const server = api.listen(PORT, () => {
    loggy.info('API server started');
    loggy.info(`API playground accessible on http://localhost:${PORT}/`);
    loggy.info(`API endpoint accessible on http://localhost:${PORT}/graphql`);
  });

  const close = () => {
    server.close();
    process.exit();
  };

  process.on('SIGUSR2', close);
  process.on('SIGUSR1', close);
};

startServer().catch(error => {
  loggy.error('Failed to start API server: ', error);

  if (process.env.NODE_ENV !== 'production') {
    // tslint:disable-next-line:no-multiline-string
    loggy.info(stripIndent`

      Make sure that:

       * A development database is running with the same
         development configuration defined in ./src/database/connection.ts

         if you haven't created a database for the API before, run:

          docker run -d --network=host -p 3306 --name=hollowverse-db \\
            -e MYSQL_ROOT_PASSWORD=123456 -e MYSQL_DATABASE=hollowverse mysql

         if you have created a database before but it's not running, run:

          docker start hollowverse-db

       * The port ${PORT} is not used by another program. If you are not sure,
         try running this command again with a custom port:

          PORT=<NEW_PORT> yarn dev

       For more details, see https://github.com/hollowverse/hollowverse/wiki/API-Development
    `);
  }

  setIsHealthy(false);
});
