import 'reflect-metadata';
import { createConnection, ConnectionOptions } from 'typeorm';

import { NotablePerson } from './entities/NotablePerson';
import { NotablePersonEvent } from './entities/NotablePersonEvent';
import { NotablePersonLabel } from './entities/NotablePersonLabel';
import { EventLabel } from './entities/EventLabel';
import { NotablePersonEventComment } from './entities/NotablePersonEventComment';
import { EditorialSummary } from './entities/EditorialSummary';
import { EditorialSummaryNode } from './entities/EditorialSummaryNode';
import { Photo } from './entities/Photo';
import { User } from './entities/User';

import { readJson } from '../helpers/readFile';
import { isUsingProductionDatabase, isProd } from '../env';
import { ColorPalette } from './entities/ColorPalette';

const entities = [
  NotablePerson,
  NotablePersonEvent,
  NotablePersonLabel,
  NotablePersonEventComment,
  EventLabel,
  User,
  EditorialSummary,
  EditorialSummaryNode,
  Photo,
  ColorPalette,
];

const {
  // These variables are for the development database
  // provided by AWS Elastic Beanstalk
  RDS_DB_NAME,
  RDS_HOSTNAME,
  RDS_PORT,
  RDS_USERNAME,
  RDS_PASSWORD,

  TYPEORM_DATABASE,
  TYPEORM_HOST,
  TYPEORM_PORT,
  TYPEORM_USERNAME,
  TYPEORM_PASSWORD,
} = process.env;

const getConfig = async (): Promise<ConnectionOptions> => {
  let databaseConfig: Partial<DatabaseConfig>;
  if (isUsingProductionDatabase) {
    // RDS Aurora instance
    databaseConfig = await readJson<DatabaseConfig>(
      'secrets/db.production.json',
    );
  } else if (isProd) {
    // AWS ElasticBeanstalk database instance
    databaseConfig = {
      database: RDS_DB_NAME,
      host: RDS_HOSTNAME,
      port: Number(RDS_PORT),
      username: RDS_USERNAME,
      password: RDS_PASSWORD,
    };
  } else {
    // Development, fallback to environment variables
    databaseConfig = {
      database: TYPEORM_DATABASE || 'hollowverse',
      host: TYPEORM_HOST || 'localhost',
      port: Number(TYPEORM_PORT) || 3306,
      username: TYPEORM_USERNAME || 'root',
      password: TYPEORM_PASSWORD || '123456',
    };
  }

  // Production configuration
  if (isProd) {
    return {
      type: 'mysql',
      ...databaseConfig,
      synchronize: false,
      dropSchema: false,
      migrationsRun: true,
      entities,
      migrations: ['dist/database/migrations/*.js'],
    };
  }

  // Fallback to development configuration
  return {
    type: 'mysql',
    ...databaseConfig,
    synchronize: false,
    dropSchema: false,
    migrationsRun: false,
    entities,
    migrations: ['src/database/migrations/*.ts'],
  };
};

export const connection = getConfig().then(createConnection);
