import type { Response } from "express";
import { StatusCodes } from "http-status-codes";

import { ErrorCause } from "@/types/errors";

import type Merror from "./merror";

export interface HttpResponse {
  data?: any;
  error?: string;
}

export function httpResponse(res: Response, code: number, body: HttpResponse): void {
  res.status(code).json(body);
}

export function httpError(res: Response, err: Merror): void {
  const rootError = err.root;

  const errMessage = rootError?.error.message ?? "An unexpected error occurred";
  switch (rootError?.error.cause) {
    case ErrorCause.DUPLICATE_ENTRY:
      httpResponse(res, StatusCodes.CONFLICT, { error: errMessage });
      return;
    case ErrorCause.ENTRY_NOT_FOUND:
      httpResponse(res, StatusCodes.NOT_FOUND, { error: errMessage });
      return;
    case ErrorCause.DATABASE_ERROR:
      httpResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { error: errMessage });
      return;
    case ErrorCause.CREDENTIALS_ERROR:
    case ErrorCause.AUTHORIZATION_ERROR:
      httpResponse(res, StatusCodes.UNAUTHORIZED, { error: errMessage });
      return;
    case ErrorCause.VALIDATION_ERROR:
      httpResponse(res, StatusCodes.BAD_REQUEST, { error: errMessage });
      return;
    default:
      httpResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { error: "unknown error occurred" });
      return;
  }
}
