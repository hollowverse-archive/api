import { GraphQLError } from 'graphql';
import { ValidationError } from 'class-validator';
import { ApiError } from './apiError';

/**
 * Picks properties of error objects that are assumed to not contain
 * potentially sensitive user data like emails and SQL queries.
 * 
 * This is used for error results in API queries
 */
function pickSafeProps(error: Error | ValidationError | any) {
  if (error instanceof ValidationError) {
    const { property, constraints } = error;

    return { property, constraints };
  } else if (error instanceof ApiError) {
    // `ApiError` knows how to remove unsafe props. Just return it as-is.
    return error;
  } else {
    const { name, code } = error;

    return { name, code };
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
