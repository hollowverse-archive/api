import { GraphQLError } from 'graphql/error';
import { ValidationError } from 'class-validator';
import { QueryFailedError } from 'typeorm';
import { UserError } from './apiError';

/**
 * Picks properties of error objects that are assumed to not contain
 * potentially sensitive user data like emails and SQL queries.
 *
 * This is used for error results in API queries
 */
function pickSafeProps(error: Error | ValidationError | QueryFailedError) {
  if (error instanceof ValidationError) {
    const { property, constraints } = error;

    return { property, constraints };
  } else if (error instanceof UserError) {
    // `ApiError` knows how to remove unsafe props. Just return it as-is.
    return error;
  } else {
    const { name } = error;

    return { name };
  }
}

export function formatError(error: GraphQLError) {
  // Remove properties that could contain sensitive data from error objects
  const { originalError, message, stack, ...rest } = error;

  if (Array.isArray(originalError)) {
    return {
      result: originalError.map(pickSafeProps),
      ...rest,
    };
  } else if (originalError) {
    return {
      ...pickSafeProps(originalError),
      ...rest,
    };
  }

  return rest;
}
