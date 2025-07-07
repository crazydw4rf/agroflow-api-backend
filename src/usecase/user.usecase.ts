import { StatusCodes } from "http-status-codes";
import { inject, injectable } from "inversify";

import type { UserWithoutPassword } from "@/entity";
import { type CreateUserType, zCreateUser } from "@/models";
import UserRepository, { type IUserRepository } from "@/repository/user.repository";
import type { Result } from "@/types/helper";
import { Err, handleError, Ok } from "@/utils/helper";
import Merror from "@/utils/merror";

export interface IUserUsecase {
  registerUser(req: CreateUserType): Promise<Result<UserWithoutPassword, Merror>>;
}

@injectable("Singleton")
export class UserUsecase implements IUserUsecase {
  constructor(@inject(UserRepository) private userRepo: IUserRepository) {}

  async registerUser(data: CreateUserType): Promise<Result<UserWithoutPassword, Merror>> {
    const { ok: result, err } = await this.userRepo.create(data);
    if (err) {
      return Err(handleError(err));
    }

    return Ok({ ...result, password: undefined });
  }
}
