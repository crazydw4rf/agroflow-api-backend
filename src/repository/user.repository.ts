// I hate typescript
import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import type { User } from "@/entity";
import { Prisma } from "@/generated/prisma/client";
import type { UserCreateInput, UserModel, UserUpdateInput } from "@/models";
import { LoggingService } from "@/services/logger";
import { AppError, ErrorCause } from "@/types/errors";
import type { Result } from "@/types/helper";
import { UserModelSym } from "@/types/symbols";
import { Err, Ok } from "@/utils";

export interface IUserRepository {
  create(user: UserCreateInput): Promise<Result<User>>;
  find(id: string): Promise<Result<User>>;
  findByEmail(email: string): Promise<Result<User>>;
  findMany(offset: number, limit: number): Promise<Result<User[]>>;
  update(id: string, user: UserUpdateInput): Promise<Result<User>>;
  delete(id: string): Promise<Result<null>>;
}

@injectable("Singleton")
export class UserRepository implements IUserRepository {
  private _logger: Logger;

  constructor(
    @inject(UserModelSym) private readonly _user: UserModel,
    @inject(LoggingService) private readonly _loggerInstance: LoggingService,
  ) {
    this._logger = this._loggerInstance.withLabel("UserRepository");
  }

  async create(user: UserCreateInput): Promise<Result<User>> {
    try {
      const createdUser = await this._user.create({ data: { ...user } });
      this._logger.debug("new user created", { ...user, password: undefined });
      return Ok(createdUser);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async find(id: string): Promise<Result<User>> {
    try {
      const user = await this._user.findFirst({ where: { id } });
      if (!user) {
        return Err(AppError.new("User not found", ErrorCause.ENTRY_NOT_FOUND));
      }

      return Ok(user);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async findByEmail(email: string): Promise<Result<User>> {
    try {
      const user = await this._user.findFirst({ where: { email } });
      if (!user) {
        return Err(AppError.new("User not found", ErrorCause.ENTRY_NOT_FOUND));
      }

      return Ok(user);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async findMany(offset: number, limit: number): Promise<Result<User[]>> {
    try {
      const users = await this._user.findMany({
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
      });

      if (users.length <= 0) {
        return Err(AppError.new("No users found", ErrorCause.ENTRY_NOT_FOUND));
      }

      return Ok(users);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async update(id: string, user: UserUpdateInput): Promise<Result<User>> {
    try {
      const updatedUser = await this._user.update({
        where: { id },
        data: { ...user },
      });
      return Ok(updatedUser);
    } catch (e) {
      return this.handleError(e);
    }
  }

  async delete(id: string): Promise<Result<null>> {
    try {
      await this._user.delete({ where: { id } });
      return Ok(null);
    } catch (e) {
      return this.handleError(e);
    }
  }

  protected handleError(e: any): Result<any> {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return Err(AppError.new("Unique constraint violation", ErrorCause.DUPLICATE_ENTRY));
      } else if (e.code === "P2025") {
        return Err(AppError.new("Entry not found", ErrorCause.ENTRY_NOT_FOUND));
      }
      return Err(AppError.new(e.message, ErrorCause.DATABASE_ERROR));
    }
    return Err(AppError.new("An unknown error occurred: ".concat(e as string), ErrorCause.UNKNOWN_ERROR));
  }
}
