#! /usr/bin/env node
import { findBreakingChanges, buildSchema } from 'graphql';
import { readFile } from '../helpers/readFile';
import got from 'got';

const MASTER_SCHEMA_URL =
  'https://raw.githubusercontent.com/hollowverse/api/master/src/schema.graphql';

// tslint:disable no-console
// tslint:disable-next-line no-floating-promises
(async () => {
  try {
    const [referenceSchema, updatedSchema] = (await Promise.all([
      got(MASTER_SCHEMA_URL).then(response => response.body),
      readFile('src/schema.graphql', 'utf8'),
    ])).map(buildSchema);

    const breakingChanges = findBreakingChanges(referenceSchema, updatedSchema);

    if (breakingChanges.length > 0) {
      console.warn(`Found ${breakingChanges.length} breaking schema changes:`);
      for (const { type, description } of breakingChanges) {
        console.log(`  * ${type}\t ${description}`);
      }
      process.exit(1);
    } else {
      console.info('No breaking schema changes were found');
      process.exit(0);
    }
  } catch (e) {
    console.error(
      'An error occured while trying to find breaking schema changes:',
      e,
    );
    process.exit(1);
  }
})();
