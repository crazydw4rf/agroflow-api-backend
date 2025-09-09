/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import type { UserWithToken } from "@/entity";
import { zLoginUser } from "@/models";
import { LoggingService } from "@/services/logger";
import type { ExtendedRequest, ExtendedResponse } from "@/types/express";
import { AuthUsecase } from "@/usecase";
import { httpResponse, sanitizeUser } from "@/utils";
import { ValidatePayload } from "@/utils/decorator";

import RouterPaths from "../path";

@injectable("Singleton")
export class AuthController {
  private _logger: Logger;

  constructor(
    @inject(AuthUsecase) private readonly _authUc: AuthUsecase,
    @inject(LoggingService) private readonly _loggerInstance: LoggingService,
  ) {
    this._logger = this._loggerInstance.withLabel("AuthController");

    this.loginUser = this.loginUser.bind(this);
  }

  @ValidatePayload(zLoginUser)
  async loginUser(req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> {
    this._logger.debug("login user", { ...req.body, password: undefined });
    const [user, err] = await this._authUc.login(req.body);
    if (err) {
      next(err);
      return;
    }

    this.setAuthCookie(res, user);

    httpResponse(res, StatusCodes.OK, sanitizeUser(user));
  }

  public refreshToken = async (_req: ExtendedRequest, res: ExtendedResponse, next: NextFunction): Promise<void> => {
    const [user, err] = await this._authUc.refreshToken(res.locals.user.id);
    if (err) {
      next(err);
      return;
    }

    this.setAuthCookie(res, user);

    res.sendStatus(StatusCodes.NO_CONTENT);
  };

  public logoutUser = (_req: ExtendedRequest, res: ExtendedResponse, _next: NextFunction): void => {
    this._logger.debug("logging out user", res.locals.user);
    res.clearCookie("token");
    res.clearCookie("refreshToken");

    res.sendStatus(StatusCodes.NO_CONTENT);
  };

  protected setAuthCookie(res: ExtendedResponse, user: UserWithToken): void {
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
