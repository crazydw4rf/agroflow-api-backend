import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import type { User } from "@/entity";
import { type UserRegisterDto, zCreateUser } from "@/models";
import { type IUserRepository, UserRepository } from "@/repository";
import { LoggingService } from "@/services/logger";
import { AppError, ErrorCause } from "@/types/errors";
import type { Result } from "@/types/helper";
import { Err, Ok } from "@/utils";

export interface IUserUsecase {
  register(dto: UserRegisterDto): Promise<Result<User>>;
  update(): Promise<Result<unknown>>;
  delete(): Promise<Result<unknown>>;
  getByID(id: string): Promise<Result<User>>;
}

@injectable("Singleton")
export class UserUsecase implements IUserUsecase {
  private _logger: Logger;

  constructor(
    @inject(UserRepository) private readonly _userRepo: IUserRepository,
    @inject(LoggingService) private readonly _loggerInstance: LoggingService,
  ) {
    this._logger = this._loggerInstance.withLabel("UserUsecase");
  }

  async register(dto: UserRegisterDto): Promise<Result<User>> {
    this._logger.debug("registering user", { ...dto, password: null });
    const validatedData = zCreateUser.safeParse(dto);
    if (!validatedData.success) {
      return Err(AppError.new("Invalid request payload", ErrorCause.VALIDATION_ERROR));
    }

    // NOTE: mending pakai bun atau library dari nodejs untuk password hashing?
    // secara default fungsi .hash() pada Bun.password menggunakan argon2
    // jika ingin menggunakan bcrypt bisa tambahkan nilai string "bcrypt" pada parameter kedua
    validatedData.data.password = await Bun.password.hash(validatedData.data.password);

    const [user, err] = await this._userRepo.create(validatedData.data);
    if (err) {
      return Err(err);
    }

    return Ok(user);
  }

  update(): Promise<Result<unknown>> {
    throw new Error("Method not implemented.");
  }

  delete(): Promise<Result<unknown>> {
    throw new Error("Method not implemented.");
  }

  async getByID(id: string): Promise<Result<User>> {
    const [user, err] = await this._userRepo.find(id);
    if (err) {
      return Err(err);
    }

    return Ok(user);
  }
}
