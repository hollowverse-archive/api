import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import moment from 'moment';
import { graphqlExpress } from 'apollo-server-express';
import playgroundExpress from 'graphql-playground-middleware-express';
import loggy from 'loggy';

import { schema } from './schema';
import { formatError } from './helpers/formatError';
import { redirectToHttps } from './redirectToHttps';
import { health, setIsHealthy } from './health';
import { SchemaContext } from './typings/schemaContext';
import { findUserByFacebookAccessToken } from './helpers/auth';
import { connection } from './database/connection';
import { isProd } from './env';
import { notablePersonBySlugLoader } from './dataLoaders/notablePerson';
import { userPhotoUrlLoader } from './dataLoaders/user';
import { photoUrlLoader } from './dataLoaders/photoUrl';

connection.catch(e => {
  loggy.error('Database connection failed: ', e);
  setIsHealthy(false);
});

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

const PRIVATE_CACHE_CONTROL = 'private, no-store';
const MAX_RESPONSE_CACHE_AGE = moment.duration(6, 'h').asSeconds();
const PUBLIC_CACHE_CONTROL = `public, max-age=${MAX_RESPONSE_CACHE_AGE}`;

api.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress(async (req, res) => {
    const context: SchemaContext = {
      userPhotoUrlLoader,
      notablePersonBySlugLoader,
      photoUrlLoader,
    };

    if (req && res) {
      const authorization = req.header('Authorization');
      if (authorization) {
        const [type, token] = authorization.split(' ');
        if (
          type === 'Bearer' &&
          typeof token === 'string' &&
          token.length > 0
        ) {
          try {
            context.viewer = await findUserByFacebookAccessToken(token);
          } catch {
            context.viewer = undefined;
          }
        }
      }

      if (req.method === 'GET' && !context.viewer) {
        res.setHeader('Cache-Control', PUBLIC_CACHE_CONTROL);
      } else {
        res.setHeader('Cache-Control', PRIVATE_CACHE_CONTROL);
      }
    }

    return {
      schema: await schema,
      formatError,
      context,
    };
  }),
);

api.get(
  '/playground',
  playgroundExpress({
    endpoint: '/graphql',
  }),
);

const PORT = process.env.PORT || 8080;

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
