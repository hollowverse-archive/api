import { GraphQLError } from 'graphql';
import { ValidationError } from 'class-validator';

/**
 * Returns `true` if the passed object conforms to the `ValidationError`
 * class exported by the `class-validator` package.
 * 
 * Note: `err instanceof ValidationError` does not actually work across
 * CommonJS modules.
 */
function isValidationError(error: object): error is ValidationError {
  return (
    typeof (error as ValidationError).property === 'string' &&
    (error as ValidationError).constraints !== undefined &&
    Array.isArray((error as ValidationError).children)
  );
}

/**
 * Picks properties of error objects that are assumed to not contain
 * potentially sensitive user data like emails and SQL queries.
 * 
 * This is used for error results in API queries
 */
function pickSafeProps(error: Error | ValidationError | any) {
  if (isValidationError(error)) {
    const { property, constraints } = error;

    return { property, constraints };
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
