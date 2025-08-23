/* eslint-disable @typescript-eslint/dot-notation */
import type { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import jwt, { JsonWebTokenError } from "jsonwebtoken";

import { ConfigService } from "@/services/config";
import { AppError, ErrorCause } from "@/types/errors";
import { isValidPayloadObject } from "@/utils";

@injectable("Singleton")
export class AuthMiddleware {
  constructor(@inject(ConfigService) private readonly _config: ConfigService) {}

  verifyJWT = (req: Request, res: Response, next: NextFunction): void => {
    const authToken = req.get("Authorization")?.split(" ")[1] ?? (req.cookies["token"] as string | undefined);
    if (!authToken) {
      next(AppError.new("token not found or expired", ErrorCause.AUTHORIZATION_ERROR));
      return;
    }

    try {
      const token = jwt.verify(authToken, this._config.env.JWT_ACCESS_SECRET, { complete: true });
      if (isValidPayloadObject(token.payload)) {
        res.locals.user = { id: token.payload.sub, role: token.payload.role };
        next();
        return;
      }

      next(AppError.new("invalid token payload", ErrorCause.VALIDATION_ERROR));
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        next(AppError.new(e.message, ErrorCause.VALIDATION_ERROR));
        return;
      }

      next(AppError.new("unknown error occurred while verifying token", ErrorCause.AUTHORIZATION_ERROR));
    }
  };

  verifyRefreshJWT = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies["refresh_token"] as string | undefined;
    if (!token) {
      next(AppError.new("refresh token not found or expired", ErrorCause.AUTHORIZATION_ERROR));
      return;
    }

    try {
      const decoded = jwt.verify(token, this._config.env.JWT_REFRESH_SECRET, { complete: true });
      if (isValidPayloadObject(decoded.payload)) {
        res.locals.user = { id: decoded.payload.sub };
        next();
        return;
      }

      next(AppError.new("invalid token payload", ErrorCause.VALIDATION_ERROR));
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        next(AppError.new(e.message, ErrorCause.VALIDATION_ERROR));
        return;
      }

      next(AppError.new("unknown error occurred while verifying token", ErrorCause.AUTHORIZATION_ERROR));
    }
  };
}
