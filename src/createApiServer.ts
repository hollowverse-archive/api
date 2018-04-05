import express from 'express';
import bodyParser from 'body-parser';
import moment from 'moment';

import { graphqlExpress } from 'apollo-server-express';
import { schema } from './schema';
import { formatError } from './helpers/formatError';
import { SchemaContext } from './typings/schemaContext';
import { createNotablePersonBySlugLoader } from './dataLoaders/notablePerson';
import { createUserPhotoUrlLoader } from './dataLoaders/user';
import { createPhotoUrlLoader } from './dataLoaders/photoUrl';
import { User } from './database/entities/User';
import { Connection } from 'typeorm';

const PRIVATE_CACHE_CONTROL = 'private, no-store';
const MAX_RESPONSE_CACHE_AGE = moment.duration(6, 'h').asSeconds();
const PUBLIC_CACHE_CONTROL = `public, max-age=${MAX_RESPONSE_CACHE_AGE}`;

export type CreateApiOptions = {
  connection: Connection;
  findUserByToken(token: string): Promise<User | undefined>;
};

export const createApiRouter = ({
  findUserByToken,
  connection,
}: CreateApiOptions) => {
  const api = express();
  api.use(bodyParser.json());

  api.use(
    graphqlExpress(async (req, res) => {
      const context: SchemaContext = {
        connection,
        userPhotoUrlLoader: createUserPhotoUrlLoader(),
        notablePersonBySlugLoader: createNotablePersonBySlugLoader(connection),
        photoUrlLoader: createPhotoUrlLoader(connection),
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
              context.viewer = await findUserByToken(token);
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

  return api;
};
