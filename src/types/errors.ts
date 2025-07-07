export type ErrorCauseType = (typeof ErrorCause)[keyof typeof ErrorCause];

export const ErrorCause = {
  ENTRY_NOT_FOUND: "ENTRY NOT FOUND",
  DATABASE_ERROR: "DATABASE ERROR",
  UNKNOWN_ERROR: "UNKNOWN ERROR",
  DUPLICATE_ENTRY: "DUPLICATE ENTRY",
  VALIDATION_ERROR: "VALIDATION ERROR",
} as const;

// We can add custom properties to the error class or object
// so it can contain more information about the error
export class RepoError extends Error {
  constructor(message: string, cause?: ErrorCauseType) {
    super(message, { cause: cause ?? ErrorCause.UNKNOWN_ERROR });
  }

  static new(message: string, cause?: ErrorCauseType): RepoError {
    return new RepoError(message, cause);
  }
}

export class HTTPError extends Error {
  public code = 500;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }

  static new(message: string, code: number): HTTPError {
    return new HTTPError(message, code);
  }
}

export class UnknownError extends Error {
  constructor(message: string, cause?: ErrorCauseType) {
    super(message, { cause: cause ?? ErrorCause.UNKNOWN_ERROR });
  }

  static new(message: string, cause?: ErrorCauseType): UnknownError {
    return new UnknownError(message, cause);
  }
}
