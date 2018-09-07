import 'reflect-metadata';
import waitForMySql from 'wait-for-mysql';
import bluebird from 'bluebird';
import { createConnection } from 'typeorm';
import { isProd } from '@hollowverse/utils/helpers/env';
import { readAwsSecretStringForStage } from '@hollowverse/utils/helpers/readAwsSecretStringForStage';
import { entities } from './entities';
import { stripIndent } from 'common-tags';
import loggy from 'loggy';

type AwsSecretsManagerDbConfig = {
  username: string;
  password: string;
  engine: string;
  host: string;
  port: number;
  dbname: string;
  dbInstanceIdentifier: string;
};

const getDatabaseConfig = async () => {
  if (process.env.STAGE === undefined || process.env.STAGE === 'local') {
    const {
      TYPEORM_DATABASE = 'hollowverse',
      TYPEORM_HOST = 'localhost',
      TYPEORM_PASSWORD = '123456',
      TYPEORM_USERNAME = 'root',
      TYPEORM_PORT = '3306',
    } = process.env;

    return {
      port: Number(TYPEORM_PORT),
      host: TYPEORM_HOST,
      username: TYPEORM_USERNAME,
      password: TYPEORM_PASSWORD,
      database: TYPEORM_DATABASE,
    };
  }

  const rawSecret = await readAwsSecretStringForStage('database-9');
  if (rawSecret === undefined) {
    throw new TypeError(
      'Could not get database config from AWS Secrets Manager',
    );
  }

  const {
    dbname: database,
    dbInstanceIdentifier,
    engine,
    ...rest
  }: AwsSecretsManagerDbConfig = JSON.parse(rawSecret);

  return {
    database,
    ...rest,
  };
};

const waitAndPrintInstructions = async () => {
  let hasConnected = false;

  const config = await getDatabaseConfig();
  const { port, host, username, database, password } = config;

  const waitForConnectionAndReturnConfig = waitForMySql
    .await({
      port,
      host,
      user: username,
      password,
      query: 'SHOW DATABASES',
      quiet: true,
    })
    .then(() => {
      hasConnected = true;

      return config;
    });

  const promises = [waitForConnectionAndReturnConfig];

  if (process.env.NODE_ENV !== 'production') {
    const delay = bluebird.delay(1500).then(() => {
      if (!hasConnected) {
        loggy.info(stripIndent`
          Waiting for MySQL server on port ${port}...

          if you haven't created a database for the API before, run:

            docker run -d -p ${port}:3306 --name=hollowverse-db \\
              -e MYSQL_ROOT_PASSWORD=${password} -e MYSQL_DATABASE=${database} mysql

          if you have run this command before, the database server may be stopped,
          you can restart it using the following command:

            docker start hollowverse-db
      `);
      }

      return waitForConnectionAndReturnConfig;
    });

    promises.push(delay);
  }

  return Promise.race(promises);
};

export const connectionPromise = waitAndPrintInstructions().then(async config =>
  createConnection({
    ...config,
    type: 'mysql',
    entities,
    migrationsRun: isProd,
    synchronize: false,
    dropSchema: false,
  }),
);
