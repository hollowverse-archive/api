import * as algoliaSearch from 'algoliasearch';
import { readJson } from './helpers/readFile';
import { isProd } from './env';

const algoliaConfig = readJson<AlgoliaAppCredentials>(
  'secrets/algoliaApp.json',
);

const algoliaClient = algoliaConfig.then(({ appId, apiKey }) =>
  algoliaSearch(appId, apiKey, { timeout: 30000 }),
);

const getIndexName = (name: string) =>
  `${name}-${isProd ? 'production' : 'dev'}`;

export const notablePersonIndex = algoliaClient.then(client =>
  client.initIndex(getIndexName('notablePerson')),
);
