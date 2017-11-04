const {
  // To use the production database, this must be set explicitly to 'true'
  // in EB environment settings. Otherwise, the testing database is used.
  USE_PRODUCTION_DATABASE,
} = process.env;

export const isUsingProductionDatabase =
  process.env.NODE_ENV === 'production' && USE_PRODUCTION_DATABASE === 'true';
