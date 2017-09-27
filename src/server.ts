import * as express from 'express';
import * as bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { schema } from './schema';
import { formatError } from './helpers/formatError';
import { redirectToHttps } from './redirectToHttps';
import { health, setIsHealthy } from './health';

import { connection } from './database/connection';

connection.catch(_ => {
  setIsHealthy(false);
});

const api = express();

api.use(redirectToHttps);

api.use('/health', health);

api.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress({
    schema,
    formatError,
  }),
);

api.use(
  '/graphiql',
  graphiqlExpress({
    endpointURL: '/graphql',
  }),
);

api.listen(process.env.PORT || 8080);
