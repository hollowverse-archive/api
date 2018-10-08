/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint-disable no-console */
const { stripIndent } = require('common-tags');
const waitForMySql = require('wait-for-mysql');
const loggy = require('loggy');
const bluebird = require('bluebird');

module.exports = async () => {
  const DB_PORT = process.env.TEST_DB_PORT || 3307;
  const DB_HOST = process.env.TEST_DB_HOST || 'localhost';
  let hasConnected = false;

  const waitForConnection = waitForMySql
    .await({
      port: Number(DB_PORT),
      host: DB_HOST,
      user: 'root',
      password: '123456',
      query: 'SHOW DATABASES',
      quiet: true,
    })
    .then(() => {
      hasConnected = true;
      process.env.TEST_DB_PORT = String(DB_PORT);
      process.env.TEST_DB_HOST = DB_HOST;
    });

  const promises = [waitForConnection];

  if (!process.env.CI) {
    const delay = bluebird.delay(1500).then(() => {
      if (!hasConnected) {
        process.stdout.write('\n');
        loggy.info(stripIndent`
          Waiting for MySQL server on port ${DB_PORT}...
          This server will be used to create temporary databases for running the
          tests.

          If you do not have a local MySQL server, you can spin up a Docker container
          with the following command in another shell:

            docker run -it \\
              -d \\
              -p ${DB_PORT}:3306 \\
              --name hollowverse-test-db-server \\
              -e MYSQL_ROOT_PASSWORD=123456 \\
              --tmpfs=/var/lib/mysql/:rw,noexec,nosuid,size=2000m \\
              --tmpfs=/tmp/:rw,noexec,nosuid,size=50m \\
            mysql:5.6

          This will launch a MySQL server with the database data stored in memory.

          If you have run the above command before, the container might be stopped,
          you can start it again:

            docker start hollowverse-test-db-server
      `);
      }

      return waitForConnection;
    });

    promises.push(delay);
  }

  return Promise.race(promises);
};
