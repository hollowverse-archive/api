#! /usr/bin/env node
import { findBreakingChanges, buildSchema } from 'graphql';
import { readFile } from '../helpers/readFile';
import * as got from 'got';

const MASTER_SCHEMA_URL = 'https://raw.githubusercontent.com/hollowverse/api/master/schema.graphql';

// tslint:disable no-console
// tslint:disable-next-line no-floating-promises
(async () => {
  try {
    const oldSchema = buildSchema((await got(MASTER_SCHEMA_URL)).body);
    const newSchema = buildSchema(String(await readFile('schema.graphql')));

    const breakingChanges = findBreakingChanges(oldSchema, newSchema);

    if (breakingChanges.length > 0) {
      console.warn(`Found ${breakingChanges.length} breaking shcmea changes:`);
      for (const { type, description } of breakingChanges) {
        console.log(`  * ${type}\t ${description}`);
      }
      process.exit(1);
    } else {
      console.info('No breaking schema changes were found');
      process.exit(0);
    }
  } catch (e) {
    console.error('An error occured while trying to find breaking schema changes:', e);
    process.exit(1);
  }
})();
