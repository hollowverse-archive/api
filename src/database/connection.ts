import 'reflect-metadata';
import { createConnection, ConnectionOptions } from 'typeorm';
import { NotablePerson } from './entities/notablePerson';
import { NotablePersonEvent } from './entities/event';
import { NotablePersonLabel } from './entities/label';
import { NotablePersonEventComment } from './entities/comment';
import { User } from './entities/user';
import { readJson } from '../helpers/readFile';
import { isUsingProductionDatabase } from '../env';

const {
  // These variables are for the development database
  // provided by AWS Elastic Beanstalk
  RDS_DB_NAME,
  RDS_HOSTNAME,
  RDS_PORT,
  RDS_USERNAME,
  RDS_PASSWORD,
} = process.env;

const getConfig = async (): Promise<ConnectionOptions> => ({
  type: 'mysql',

  ...isUsingProductionDatabase
    ? {
        ...await readJson<DatabaseConfig>('secrets/db.production.json'),

        // Do not set any of these to `true`,
        // otherwise the database will be destroyed
        synchronize: false,
        dropSchema: false,
      }
    : {
        database: RDS_DB_NAME || 'hollowverse',
        host: RDS_HOSTNAME || 'localhost',
        port: Number(RDS_PORT) || 3306,
        username: RDS_USERNAME || 'root',
        password: RDS_PASSWORD || '123456',
        synchronize: true,
        dropSchema: false,
      },
});

export const connection = getConfig().then(async config =>
  createConnection({
    ...config,
    entities: [
      NotablePerson,
      NotablePersonEvent,
      NotablePersonLabel,
      NotablePersonEventComment,
      User,
    ],
  }),
);
