const {
  NODE_ENV,

  // To use the production database, this must be set explicitly to 'true'
  // in EB environment settings. Otherwise, the testing database is used.
  USE_PRODUCTION_DATABASE,
} = process.env;

export const isProd = NODE_ENV === 'production';

export const isUsingProductionDatabase =
  isProd && USE_PRODUCTION_DATABASE === 'true';
