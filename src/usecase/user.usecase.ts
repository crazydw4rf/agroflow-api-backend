import argon2 from "argon2"
import { inject, injectable } from "inversify";
import * as jwt from "jsonwebtoken"

import type { User, UserWithToken } from "@/entity";
import { type UserLoginRequest, type UserRegisterRequest, zCreateUser, zLoginUser } from "@/models";
import { type IUserRepository, UserRepository } from "@/repository";
import { ConfigService } from "@/services/config";
import { AppError,ErrorCause } from "@/types/errors";
import type { Result } from "@/types/helper";
import { Err, Ok } from "@/utils/helper";

export interface IUserUsecase {
  register(req: UserRegisterRequest): Promise<Result<User>>;
  login(req: UserLoginRequest): Promise<Result<UserWithToken>>;
  logout(): Promise<Result<unknown>>;
  update(): Promise<Result<unknown>>;
  delete(): Promise<Result<unknown>>;
  getByID(): Promise<Result<unknown>>;
}

@injectable("Singleton")
export class UserUsecase implements IUserUsecase {
  constructor(
    @inject(UserRepository) private _userRepo: IUserRepository,
    @inject(ConfigService) private _config: ConfigService,
  ) { }

  async register(req: UserRegisterRequest): Promise<Result<User>> {
    const parsed = zCreateUser.safeParse(req);
    if (!parsed.success) {
      return Err(AppError.new("Invalid request payload", ErrorCause.VALIDATION_ERROR));
    }

    const { ok: user, err } = await this._userRepo.create(parsed.data);
    if (err) {
      return Err(err);
    }

    return Ok(user);
  }

  async login(req: UserLoginRequest): Promise<Result<UserWithToken>> {
    const parsed = zLoginUser.safeParse(req);
    if (!parsed.success) {
      return Err(AppError.new("Invalid request payload", ErrorCause.VALIDATION_ERROR));
    }

    const { ok: user, err } = await this._userRepo.findByEmail(parsed.data.email);
    if (err) {
      return Err(err);
    }

    const verifyPasswd = await argon2.verify(user.password, req.password)
    if (!verifyPasswd) {
      return Err(AppError.new("Invalid password", ErrorCause.CREDENTIALS_ERROR));
    }

    const token = jwt.sign({ id: user.id }, this._config.env.JWT_SECRET, this._config.app.jwt);

    return Ok({ ...user, token });
  }

  async logout(): Promise<Result<unknown>> {
    throw new Error("Method not implemented.");
  }

  async update(): Promise<Result<unknown>> {
    throw new Error("Method not implemented.");
  }

  async delete(): Promise<Result<unknown>> {
    throw new Error("Method not implemented.");
  }

  async getByID(): Promise<Result<unknown>> {
    throw new Error("Method not implemented.");
  }
}
