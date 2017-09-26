import 'reflect-metadata';
import { createConnection, ConnectionOptions } from 'typeorm';
import { NotablePerson } from './entities/notablePerson';
import { Event } from './entities/event';
import { Label } from './entities/label';
import { Comment } from './entities/comment';
import { User } from './entities/user';
import { readJson } from '../helpers/readJson';
import { isUsingProductionDatabase } from './env';

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
        username: RDS_PASSWORD || 'root',
        password: RDS_USERNAME || '123456',
      },
});

export const connection = getConfig().then(config =>
  createConnection({
    ...config,
    entities: [NotablePerson, Event, Label, Comment, User],
  }),
);
