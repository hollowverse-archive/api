import 'reflect-metadata';
import faker from 'faker';
import { createConnection } from 'typeorm';
import { isProd } from '@hollowverse/utils/helpers/env';
import { entities } from './entities';

const {
  TYPEORM_DATABASE,
  TYPEORM_HOST,
  TYPEORM_PASSWORD,
  TYPEORM_USERNAME,
  TYPEORM_PORT,
} = process.env;

export const connectionPromise = createConnection({
  type: 'mysql',
  name: faker.random.alphaNumeric(10),
  synchronize: false,
  dropSchema: false,
  migrationsRun: isProd,
  entities,
  database: TYPEORM_DATABASE,
  host: TYPEORM_HOST,
  port: Number(TYPEORM_PORT),
  username: TYPEORM_USERNAME,
  password: TYPEORM_PASSWORD,
  migrations: isProd
    ? ['dist/database/migrations/*.js']
    : ['src/database/migrations/*.ts'],
});
