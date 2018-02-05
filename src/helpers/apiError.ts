import { UserErrorType } from '../typings/schema';

const messagesByErrorType: Record<UserErrorType, string> = {
  OPERATION_NOT_ALLOWED: 'This operation is not allowed',
  AUTHENTICATION_REQUIRED:
    'This operation requires that the request is authenticated',
  INVALID_ACCESS_TOKEN:
    'The passed access token is either empty, expired or invalid',
};

type UserErrorOptions = {
  isSensitive: boolean;
};

const defaultOptions: UserErrorOptions = {
  isSensitive: true,
};

/**
 * Custom error class, requires a pre-defined
 * error type and handles removing potentially sensitive properties.
 */
export class UserError extends Error {
  /**
   * @param type One of the pre-defined user error types.
   * @param message If not defined, the default error message for the specified
   * error type is used.
   * @param options When `options.isSensitive` is set to `true`,
   * it makes sure to remove sensitive props from the error object.
   */
  constructor(
    type: UserErrorType,
    message: string = messagesByErrorType[type],
    options: UserErrorOptions = defaultOptions,
  ) {
    super();
    this.name = type;
    this.message = message;
    if (options.isSensitive) {
      delete this.stack;
    }
  }
}
