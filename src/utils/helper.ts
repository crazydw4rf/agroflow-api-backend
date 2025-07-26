import { AppError, ErrorCause } from "@/types/errors";
import type { Result } from "@/types/helper";

import Merror from "./merror";

export function Err(error: Merror | Error): Result<any, Merror> {
  if (error instanceof Merror) {
    return { ok: undefined, err: error };
  } else if (error instanceof Error) {
    return { ok: undefined, err: Merror.new(error) };
  }

  return { ok: undefined, err: Merror.new(AppError.new("unknown error", ErrorCause.UNKNOWN_ERROR)) };
}

export function Ok<T>(ok: T): Result<T, any> {
  return { ok, err: undefined };
}


