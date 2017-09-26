import 'reflect-metadata';
import { createConnection, ConnectionOptions } from 'typeorm';
import { NotablePerson } from './entities/notablePerson';
import { Event } from './entities/event';
import { Label } from './entities/label';
import { Comment } from './entities/comment';
import { User } from './entities/user';
import { readJson } from '../helpers/readJson';

const {
  // These variables are for the development database
  // provided by AWS Elastic Beanstalk
  RDS_DB_NAME,
  RDS_HOSTNAME,
  RDS_PORT,
  RDS_USERNAME,
  RDS_PASSWORD,

  // To use the production database, this must be set explicitly to 'true'
  // in EB environment settings. Otherwise, the testing database is used.
  USE_PRODUCTION_DATABASE,
} = process.env;

const getConfig = async (): Promise<ConnectionOptions> => ({
  type: 'mysql',

  ...process.env.NODE_ENV === 'production' && USE_PRODUCTION_DATABASE === 'true'
    ? {
        ...await readJson<DatabaseConfig>('secrets/db.production.json'),

        // Do not any of these set to `true`,
        // otherwise the database will be destroyed
        synchronize: false,
        dropSchema: false,
      }
    : {
        database: RDS_DB_NAME || 'hollowverse',
        host: RDS_HOSTNAME || 'localhost',
        port: Number(RDS_PORT) || 3306,
        username: RDS_PASSWORD || '123456',
        password: RDS_USERNAME || 'root',
      },
});

export const connection = getConfig().then(config =>
  createConnection({
    ...config,
    entities: [NotablePerson, Event, Label, Comment, User],
  }),
);
