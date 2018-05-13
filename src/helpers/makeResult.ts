import { ErrorCode, ErrorResult, SuccessResult } from '../typings/schema';

export function makeErrorResult(
  errorCode: ErrorCode,
  errorMessage: string,
): ErrorResult {
  return {
    state: 'error',
    errors: [{ code: errorCode, message: errorMessage }],
  };
}

export function makeSuccessResult(): SuccessResult {
  return {
    state: 'success',
  };
}
