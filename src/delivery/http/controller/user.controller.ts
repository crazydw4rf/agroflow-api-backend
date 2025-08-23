/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import { LoggingService } from "@/services/logger";
import { type IUserUsecase, UserUsecase } from "@/usecase/user.usecase";
import { sanitizeUser } from "@/utils";
import { httpResponse } from "@/utils/http";

@injectable("Singleton")
export class UserController {
  private _logger: Logger;

  constructor(
    @inject(UserUsecase) private readonly _userUc: IUserUsecase,
    @inject(LoggingService) private readonly _loggerInstance: LoggingService,
  ) {
    this._logger = this._loggerInstance.withLabel("UserController");
  }
  public registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const [result, err] = await this._userUc.register(req.body);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.CREATED, { data: sanitizeUser(result) });
  };

  public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    throw new Error("Method not implemented.");
  };
  public updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    throw new Error("Method not implemented.");
  };

  public me = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    const [user, err] = await this._userUc.getByID(res.locals.user.id);
    if (err) {
      next(err);
      return;
    }

    httpResponse(res, StatusCodes.OK, { data: sanitizeUser(user) });
  };
}
