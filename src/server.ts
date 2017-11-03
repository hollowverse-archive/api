import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { schema } from './schema';
import { formatError } from './helpers/formatError';
import { redirectToHttps } from './redirectToHttps';
import { health, setIsHealthy } from './health';
import { SchemaContext } from './typings/schemaContext';
import { findUserByFacebookAccessToken } from './helpers/auth';
import { connection } from './database/connection';
import { isProd } from './env';

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

api.use('/health', health);

api.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress(async req => {
    const context: SchemaContext = {};
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
