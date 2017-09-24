import * as express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { schema } from './schema';

const app = express();

app.use('/graphql', graphqlExpress({ schema }));

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

app.listen(process.env.PORT || 8080);
