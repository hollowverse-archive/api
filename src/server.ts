import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as moment from 'moment';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { schema } from './schema';
import { formatError } from './helpers/formatError';
import { redirectToHttps } from './redirectToHttps';
import { health, setIsHealthy } from './health';
import { SchemaContext } from './typings/schemaContext';
import { findUserByFacebookAccessToken } from './helpers/auth';
import { connection } from './database/connection';
import { isProd } from './env';
import * as DataLoader from 'dataloader';
import { getPhotoUrlByFbId } from './helpers/facebook';

connection.catch(_ => {
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

api.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress(async req => {
    const context: SchemaContext = {
      userPhotoUrlLoader: new DataLoader<string, string>(async fbIds => {
        return Promise.all(
          fbIds.map(async fbId => getPhotoUrlByFbId(fbId, 'normal')),
        );
      }),
    };
    if (req) {
      const authorization = req.header('Authorization');
      if (authorization) {
        const [type, token] = authorization.split(' ');
        if (
          type === 'Bearer' &&
          typeof token === 'string' &&
          token.length > 0
        ) {
          context.viewer = await findUserByFacebookAccessToken(token);
        }
      }
    }

    return {
      schema: await schema,
      formatError,
      context,
    };
  }),
);

const debugHeaders = [
  process.env.FB_ACCESS_TOKEN
    ? `'Authorization': 'Bearer ${process.env.FB_ACCESS_TOKEN}'`
    : null,
].filter(Boolean);

api.use(
  '/graphiql',
  graphiqlExpress({
    endpointURL: '/graphql',
    ...process.env.NODE_ENV === 'production'
      ? undefined
      : {
          passHeader: debugHeaders.join('\n'),
        },
  }),
);

api.listen(process.env.PORT || 8080);
