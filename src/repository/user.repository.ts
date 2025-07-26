// I hate typescript
import { inject, injectable } from "inversify";

import type { User } from "@/entity";
import { Prisma } from "@/generated/prisma";
import type { UserCreateInput, UserUpdateInput } from "@/models";
import { PrismaService } from "@/services/prisma";
import { AppError,ErrorCause } from "@/types/errors";
import type { Result } from "@/types/helper";
import { Err, Ok } from "@/utils/helper";
import Merror from "@/utils/merror";

export interface IUserRepository {
  create(user: UserCreateInput): Promise<Result<User>>;
  find(id: string): Promise<Result<User>>;
  findByEmail(email: string): Promise<Result<User>>;
  findMany(offset: number, limit: number): Promise<Result<User[]>>;
  update(id: string, user: UserUpdateInput): Promise<Result<User>>;
  delete(id: string): Promise<Merror>;
}

@injectable("Singleton")
export class UserRepository implements IUserRepository {
  constructor(@inject(PrismaService) private readonly _prisma: PrismaService) { }

  async create(user: UserCreateInput): Promise<Result<User>> {
    try {
      const createdUser = await this._prisma.user.create({ data: { ...user } });
      return Ok(createdUser);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          // Unique constraint violation
          return Err(AppError.new("User already exists", ErrorCause.DUPLICATE_ENTRY));
        }
        return Err(AppError.new(e.message, ErrorCause.DATABASE_ERROR));
      }
      return Err(AppError.new("Failed to create user: ".concat(e as string), ErrorCause.UNKNOWN_ERROR));
    }
  }

  async find(id: string): Promise<Result<User>> {
    try {
      const user = await this._prisma.user.findFirst({ where: { id } });
      if (!user) {
        return Err(AppError.new("User not found", ErrorCause.ENTRY_NOT_FOUND));
      }

      return Ok(user);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        return Err(AppError.new(e.message, ErrorCause.DATABASE_ERROR));
      }
      return Err(AppError.new("Failed to find user: ".concat(e as string), ErrorCause.UNKNOWN_ERROR));
    }
  }

  async findByEmail(email: string): Promise<Result<User>> {
    try {
      const user = await this._prisma.user.findFirst({ where: { email } });
      if (!user) {
        return Err(AppError.new("User not found", ErrorCause.ENTRY_NOT_FOUND));
      }

      return Ok(user);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        return Err(AppError.new(e.message, ErrorCause.DATABASE_ERROR));
      }
      return Err(AppError.new("Failed to find user by email: ".concat(e as string), ErrorCause.UNKNOWN_ERROR));
    }
  }

  async findMany(offset: number, limit: number): Promise<Result<User[]>> {
    try {
      const users = await this._prisma.user.findMany({
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
      });

      if (users.length === 0) {
        return Err(AppError.new("No users found", ErrorCause.ENTRY_NOT_FOUND));
      }

      return Ok(users);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        return Err(AppError.new(e.message, ErrorCause.DATABASE_ERROR));
      }
      return Err(AppError.new("Failed to find users: ".concat(e as string), ErrorCause.UNKNOWN_ERROR));
    }
  }

  async update(id: string, user: UserUpdateInput): Promise<Result<User>> {
    try {
      const updatedUser = await this._prisma.user.update({
        where: { id },
        data: { ...user },
      });
      return Ok(updatedUser);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          return Err(AppError.new("User not found", ErrorCause.ENTRY_NOT_FOUND));
        }
        return Err(AppError.new(e.message, ErrorCause.DATABASE_ERROR));
      }
      return Err(AppError.new("Failed to update user: ".concat(e as string), ErrorCause.UNKNOWN_ERROR));
    }
  }

  async delete(id: string): Promise<Merror> {
    try {
      await this._prisma.user.delete({
        where: { id },
      });
      return Merror.new(AppError.new("User deleted successfully", ErrorCause.ENTRY_NOT_FOUND));
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          return Merror.new(AppError.new("User not found", ErrorCause.ENTRY_NOT_FOUND));
        }
        return Merror.new(AppError.new(e.message, ErrorCause.DATABASE_ERROR));
      }
      return Merror.new(AppError.new("Failed to delete user: ".concat(e as string), ErrorCause.UNKNOWN_ERROR));
    }
  }
}

