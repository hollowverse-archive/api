#! /usr/bin/env node

/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint-disable no-console */
const shelljs = require('shelljs');
const { decryptSecrets } = require('@hollowverse/utils/helpers/decryptSecrets');
const {
  executeCommands,
} = require('@hollowverse/utils/helpers/executeCommands');
const {
  executeCommandsInParallel,
} = require('@hollowverse/utils/helpers/executeCommandsInParallel');
const { writeJsonFile } = require('@hollowverse/utils/helpers/writeJsonFile');
const { createZipFile } = require('@hollowverse/utils/helpers/createZipFile');

const {
  ENC_PASS_DB,
  ENC_PASS_FB,
  ENC_PASS_ALGOLIA,
  IS_PULL_REQUEST,
  PROJECT,
  BRANCH,
  COMMIT_ID,
} = shelljs.env;

const isPullRequest = IS_PULL_REQUEST !== 'false';

const secrets = [
  {
    password: ENC_PASS_DB,
    decryptedFilename: 'db.production.json',
  },
  {
    password: ENC_PASS_FB,
    decryptedFilename: 'facebookApp.json',
  },
  {
    password: ENC_PASS_ALGOLIA,
    decryptedFilename: 'algoliaApp.json',
  },
];

const ebEnvironmentName = `${PROJECT}-${BRANCH}`;

async function main() {
  const buildCommands = [
    // Download and extract master and beta branches of the web app
    // to validate the GraphQL queries used in the web app against
    // the (possibly) updated API schema. This helps prevent
    // breaking the API for already-deployed versions of the web app.
    //
    // The actual validation is performed by `yarn validate-queries`
    // which is run as part of `yarn test`.
    () =>
      executeCommandsInParallel(
        ['master', 'beta'].map(branch => () =>
          executeCommands([
            `mkdir -p clients/${branch}`,
            `wget -qO- https://api.github.com/repos/hollowverse/hollowverse/tarball/${branch}` +
              ` | tar xz -C clients/${branch}`,
          ]),
        ),
      ),
    'yarn test',
    'yarn build',
  ];
  const deploymentCommands = [
    () =>
      writeJsonFile('env.json', {
        BRANCH,
        COMMIT_ID,
      }),
    () => decryptSecrets(secrets, './secrets'),
    () =>
      createZipFile(
        'build.zip',
        [
          'schema.graphql',
          'dist/**/*',
          'secrets/**/*',
          'yarn.lock',
          'package.json',
          'env.json',
          'Dockerfile',
          '.dockerignore',
        ],
        ['secrets/**/*.enc'],
      ),
    `eb use ${ebEnvironmentName}`,
    'eb deploy --staged --debug --timeout 15',
  ];

  let isDeployment = false;
  if (isPullRequest === true) {
    console.info('Skipping deployment commands in PRs');
  } else if (secrets.some(secret => secret.password === undefined)) {
    console.info(
      'Skipping deployment commands because some secrets are not provided',
    );
  } else if (BRANCH !== 'master') {
    console.info('Skipping deployment because it is not the master branch');
  } else {
    isDeployment = true;
  }

  try {
    await executeCommands(
      isDeployment ? [...buildCommands, ...deploymentCommands] : buildCommands,
    );
  } catch (e) {
    console.error('Build/deployment failed:', e);
    process.exit(1);
  }
}

main();
