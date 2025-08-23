/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import type { UserWithToken } from "@/entity";
import { LoggingService } from "@/services/logger";
import { AuthUsecase } from "@/usecase";
import { httpResponse, sanitizeUser } from "@/utils";

import RouterPaths from "../path";

@injectable("Singleton")
export class AuthController {
  private _logger: Logger;

  constructor(
    @inject(AuthUsecase) private readonly _authUc: AuthUsecase,
    @inject(LoggingService) private readonly _loggerInstance: LoggingService,
  ) {
    this._logger = this._loggerInstance.withLabel("AuthUsecase");
  }

  public loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const [user, err] = await this._authUc.login(req.body);
    if (err) {
      next(err);
      return;
    }

    this.setAuthCookie(res, user);

    httpResponse(res, StatusCodes.OK, { data: sanitizeUser(user) });
  };

  public refreshToken = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    const [user, err] = await this._authUc.refreshToken(res.locals.user.id);
    if (err) {
      next(err);
      return;
    }

    this.setAuthCookie(res, user);

    res.sendStatus(StatusCodes.NO_CONTENT);
  };

  public logoutUser = (_req: Request, res: Response, _next: NextFunction): void => {
    this._logger.debug("logging out user", res.locals.user);
    res.clearCookie("token");
    res.clearCookie("refreshToken");

    res.sendStatus(StatusCodes.NO_CONTENT);
  };

  protected setAuthCookie(res: Response, user: UserWithToken): void {
    res.cookie("token", user.accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      maxAge: 60 * 15 * 1000, // 15 menit
    });

    res.cookie("refresh_token", user.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: `${RouterPaths.AUTH}/refresh`,
      maxAge: 60 * 60 * 24 * 30 * 1000, // 1 bulan
    });
  }
}
