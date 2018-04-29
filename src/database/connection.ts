import 'reflect-metadata';
import faker from 'faker';
import { createConnection } from 'typeorm';
import { isProd } from '@hollowverse/utils/helpers/env';
import { entities } from './entities';

export const connectionPromise = createConnection({
  type: 'mysql',
  name: faker.random.alphaNumeric(10),
  synchronize: false,
  dropSchema: false,
  migrationsRun: isProd,
  entities,
  migrations: isProd
    ? ['dist/database/migrations/*.js']
    : ['src/database/migrations/*.ts'],
});
