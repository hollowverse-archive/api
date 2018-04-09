/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint-disable no-console */
const { stripIndent } = require('common-tags');
// @ts-ignore
const waitForMySql = require('wait-for-mysql');
const bluebird = require('bluebird');

module.exports = async () => {
  const DB_PORT = process.env.TEST_DB_PORT || 3306;
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
    });

  const promises = [waitForConnection];

  if (!process.env.CI) {
    const delay = bluebird.delay(1500).then(() => {
      if (!hasConnected) {
        console.info('\n');
        console.info(stripIndent`
        Waiting for MySQL server on port ${DB_PORT}...
        This server will be used to create temporary databases for running the
        tests.
  
        If you do not have a local MySQL server, you can spin up a Docker container
        with the following command in another shell:
  
          docker run -it \\
           -p ${DB_PORT}:3306 \\
           --name hollowverse-test-db-server \\
           -e MYSQL_ROOT_PASSWORD=123456 \\
          --tmpfs=/var/lib/mysql/:rw,noexec,nosuid,size=2000m \\
          --tmpfs=/tmp/:rw,noexec,nosuid,size=50m \\
           mysql:5.6
        
        This will launch a MySQL server with the database data stored in memory.
      `);
      }

      return waitForConnection;
    });

    promises.push(delay);
  }

  return Promise.race(promises);
};
