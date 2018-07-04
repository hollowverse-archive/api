const messagesByErrorType = {
  OperationNotAllowedError: 'This operation is not allowed',
  MustBeAuthorizedError:
    'This operation requires that the request is authenticated',
  InvalidAccessTokenError:
    'The passed access token is either empty, expired or invalid',
  RoleMismatchError:
    'The requested operation can only be performed by user with specific roles',
  InternalError: 'An internal API error has occurred',
};

type ApiErrorType = keyof typeof messagesByErrorType;

type ApiErrorOptions = {
  isSensitive: boolean;
};

const defaultOptions: ApiErrorOptions = {
  isSensitive: true,
};

/**
 * Custom API error class, requires a pre-defined
 * error type and handles removing potentially sensitive properties.
 */
export class ApiError extends Error {
  /**
   * @param type One of the pre-defined API error types.
   * @param message If not defined, the default error message for the specified
   * error type is used.
   * @param options When `options.isSensitive` is set to `true`,
   * it makes sure to remove sensitive props from the error object.
   */
  constructor(
    type: ApiErrorType,
    message: string = messagesByErrorType[type],
    options: ApiErrorOptions = defaultOptions,
  ) {
    super();
    this.name = type;
    this.message = message;
    if (options.isSensitive) {
      delete this.stack;
    }
  }
}
