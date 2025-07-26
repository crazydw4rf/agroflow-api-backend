/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { inject, injectable } from "inversify";
import ms from "ms";

import type { User } from "@/entity";
import { ConfigService } from "@/services/config";
import { type IUserUsecase, UserUsecase } from "@/usecase/user.usecase";
import { httpError, httpResponse } from "@/utils/http";

export interface IUserController {
  registerUser(req: Request, res: Response): Promise<void>;
  loginUser(req: Request, res: Response): Promise<void>;
}

@injectable("Singleton")
export class UserController implements IUserController {
  constructor(
    @inject(ConfigService) private readonly _config: ConfigService,
    @inject(UserUsecase) private readonly _userUc: IUserUsecase
  ) {
    // Melakukan bind pada method agar nilai this tetap mengacu pada class UserController.
    // Alternatif lain adalah mengubah method menjadi arrow function.
    this.registerUser = this.registerUser.bind(this);
    this.loginUser = this.loginUser.bind(this);
  }

  async registerUser(req: Request, res: Response): Promise<void> {
    const { ok: result, err } = await this._userUc.register(req.body);
    if (err) {
      httpError(res, err)
      return;
    }

    httpResponse(res, StatusCodes.CREATED, { data: result });
  }

  async loginUser(req: Request, res: Response): Promise<void> {
    const { ok: user, err } = await this._userUc.login(req.body);
    if (err) {
      httpError(res, err);
      return;
    }

    this.setAuthCookie(res, user.token)

    res.status(StatusCodes.OK)
    httpResponse(res, StatusCodes.OK, { data: this.sanitizeUser(user) });
  }


  protected setAuthCookie(res: Response, token: string): void {
    res.cookie("token", token, {
      httpOnly: true,
      domain: this._config.env.DOMAIN_NAME,
      expires: new Date(Date.now() + ms("7d")),
    })
  }

  protected sanitizeUser<T extends User>(user: T): T {
    return { ...user, password: undefined, token: undefined, id: undefined }
  }
}
