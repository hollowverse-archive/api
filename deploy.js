#! /usr/bin/env node

// @ts-check

/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint-disable no-console */
const shelljs = require('shelljs');
const {
  executeCommands,
} = require('@hollowverse/utils/helpers/executeCommands');
const {
  executeCommandsConcurrently,
} = require('@hollowverse/utils/helpers/executeCommandsConcurrently');

const { IS_PULL_REQUEST, BRANCH, STAGE = 'development' } = shelljs.env;

const isPullRequest = IS_PULL_REQUEST !== 'false';

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
      executeCommandsConcurrently(
        ['master', 'beta'].map(branch => () =>
          executeCommands([
            `mkdir -p clients/${branch}`,
            `curl -SL --silent https://api.github.com/repos/hollowverse/hollowverse/tarball/${branch}` +
              ` | tar xz -C clients/${branch}`,
          ]),
        ),
      ),
    'yarn test',
  ];
  const deploymentCommands = [
    `yarn serverless create_domain --stage ${STAGE}`,
    `NODE_ENV=production yarn serverless deploy --aws-s3-accelerate --stage ${STAGE}`,
  ];

  let isDeployment = false;
  if (isPullRequest === true) {
    console.info('Skipping deployment commands in PRs');
    buildCommands.push(
      'NODE_ENV=production yarn serverless package --stage production',
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
