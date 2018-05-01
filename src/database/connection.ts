import 'reflect-metadata';
import waitForMySql from 'wait-for-mysql';
import bluebird from 'bluebird';
import { createConnection } from 'typeorm';
import { isProd } from '@hollowverse/utils/helpers/env';
import { entities } from './entities';
import { stripIndent } from 'common-tags';
import loggy from 'loggy';

const {
  TYPEORM_DATABASE,
  TYPEORM_HOST,
  TYPEORM_PASSWORD,
  TYPEORM_USERNAME,
  TYPEORM_PORT,
} = process.env;

const waitAndPrintInstructions = async () => {
  let hasConnected = false;

  const waitForConnection = waitForMySql
    .await({
      port: Number(TYPEORM_PORT),
      host: TYPEORM_HOST,
      user: TYPEORM_USERNAME,
      password: TYPEORM_PASSWORD,
      query: 'SHOW DATABASES',
      quiet: true,
    })
    .then(() => {
      hasConnected = true;
    });

  const promises = [waitForConnection];

  if (process.env.NODE_ENV !== 'production') {
    const delay = bluebird.delay(1500).then(() => {
      if (!hasConnected) {
        loggy.info(stripIndent`
          Waiting for MySQL server on port ${TYPEORM_PORT}...

          if you haven't created a database for the API before, run:

            docker run -d --network=host -p ${TYPEORM_PORT}:3306 --name=hollowverse-db \\
              -e MYSQL_ROOT_PASSWORD=${TYPEORM_PASSWORD} -e MYSQL_DATABASE=${TYPEORM_DATABASE} mysql

          if you have run this command before, the database server may be stopped,
          you can restart it using the following command:

            docker start hollowverse-db
      `);
      }

      return waitForConnection;
    });

    promises.push(delay);
  }

  return Promise.race(promises);
};

export const connectionPromise = waitAndPrintInstructions().then(async () =>
  createConnection({
    type: 'mysql',
    synchronize: false,
    dropSchema: false,
    migrationsRun: isProd,
    entities,
    database: TYPEORM_DATABASE,
    host: TYPEORM_HOST,
    port: Number(TYPEORM_PORT),
    username: TYPEORM_USERNAME,
    password: TYPEORM_PASSWORD,
  }),
);
