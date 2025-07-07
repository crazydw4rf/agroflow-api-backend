import { ErrorCause, HTTPError, UnknownError } from "@/types/errors";
import type { Result } from "@/types/helper";

import Merror from "./merror";

export function Err(error: Merror | Error): Result<any, Merror> {
  if (error instanceof Merror) {
    return { ok: undefined, err: error };
  } else if (error instanceof Error) {
    return { ok: undefined, err: Merror.new(error) };
  }

  return { ok: undefined, err: Merror.new(UnknownError.new("unknown error", ErrorCause.UNKNOWN_ERROR)) };
}

export function Ok<T>(ok: T): Result<T, any> {
  return { ok, err: undefined };
}

export function handleError(error: Merror): Merror {
  switch (error.latestError?.cause) {
    case ErrorCause.ENTRY_NOT_FOUND:
      return error.wrap(HTTPError.new("Entry not found", 404));
    case ErrorCause.DUPLICATE_ENTRY:
      return error.wrap(HTTPError.new("Duplicate entry", 409));
    case ErrorCause.DATABASE_ERROR:
      return error.wrap(HTTPError.new("Database error", 500));
    default:
      return error.wrap(HTTPError.new("Unknown error", 500));
  }
}
