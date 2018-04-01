import algoliaSearch from 'algoliasearch';
import { readJson } from './helpers/readFile';
import { isProd } from './env';

const algoliaConfig = readJson<AlgoliaAppCredentials>(
  'secrets/algoliaApp.json',
);

export const getIndexName = (name: string) =>
  `${name}-${isProd ? 'production' : 'dev'}`;

export const algoliaClient = algoliaConfig.then(({ appId, apiKey }) =>
  algoliaSearch(appId, apiKey, { timeout: 30000 }),
);

export const notablePersonIndex = algoliaClient.then(client =>
  client.initIndex(getIndexName('notablePerson')),
);
