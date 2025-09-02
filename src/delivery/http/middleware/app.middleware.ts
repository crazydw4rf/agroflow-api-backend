import { randomUUIDv7 as randomUUID } from "bun";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { inject, injectable } from "inversify";
import type { Logger } from "winston";
import type { ZodObject } from "zod/v4";

import { LoggingService } from "@/services/logger";
import { AppError, ErrorCause } from "@/types/errors";
import { httpError } from "@/utils/http";
import Merror from "@/utils/merror";

@injectable("Singleton")
export class AppMiddleware {
  private _logger: Logger;

  constructor(@inject(LoggingService) private readonly _loggerInstance: LoggingService) {
    this._logger = this._loggerInstance.withLabel("AppMiddleware");
  }

  public httpLogger = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    const { method, path } = req;
    const reqId = res.get("X-Request-Id");

    res.on("finish", () => {
      this._logger.debug(`${method} ${path} ${res.statusCode} - ${Date.now() - start}ms`, {
        requestId: reqId,
      });
    });

    next();
  };

  public requestId = (req: Request, res: Response, next: NextFunction): void => {
    const reqId = req.get("X-Request-Id");
    if (!reqId) {
      res.set({ "X-Request-Id": randomUUID() });
    }

    next();
  };

  // TODO: kirim pesan error tentang field apa saja yang tidak valid
  public validatePayload = (z: ZodObject): RequestHandler => {
    return (req: Request, _: Response, next: NextFunction): void => {
      const { success } = z.safeParse(req.body);
      if (!success) {
        next(AppError.new("invalid request payload", ErrorCause.VALIDATION_ERROR));
        return;
      }

      next();
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public errorHandling = (err: Error | Merror, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof Merror) {
      this._logger.error("an error occurred while processing the request", err.root);
      httpError(res, err);
      return;
    }

    this._logger.error("an unexpected error occurred", { message: err.message, cause: err.cause });

    httpError(res, Merror.new(err));
  };
}
