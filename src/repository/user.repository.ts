// I hate typescript
import { inject, injectable } from "inversify";

import type { User } from "@/entity";
import { Prisma } from "@/generated/prisma";
import type { UserCreateInput, UserUpdateInput } from "@/models";
import { PrismaService } from "@/services/prisma";
import { ErrorCause, RepoError } from "@/types/errors";
import type { Result } from "@/types/helper";
import { Err, Ok } from "@/utils/helper";
import Merror from "@/utils/merror";

export interface IUserRepository {
  create(user: UserCreateInput): Promise<Result<User, Merror>>;
  find(id: string): Promise<Result<User, Merror>>;
  findMany(offset: number, limit: number): Promise<Result<User[], Merror>>;
  update(id: string, user: UserUpdateInput): Promise<Result<User, Merror>>;
  delete(id: string): Promise<Merror>;
}

@injectable("Singleton")
class UserRepository implements IUserRepository {
  constructor(@inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(user: UserCreateInput): Promise<Result<User, Merror>> {
    try {
      const createdUser = await this.prisma.user.create({ data: { ...user } });
      return Ok(createdUser);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          // Unique constraint violation
          return Err(RepoError.new("User already exists", ErrorCause.DUPLICATE_ENTRY));
        }
        return Err(RepoError.new(e.message, ErrorCause.DATABASE_ERROR));
      }
      return Err(RepoError.new("Failed to create user: ".concat(e as string), ErrorCause.UNKNOWN_ERROR));
    }
  }

  async find(id: string): Promise<Result<User, Merror>> {
    try {
      const user = await this.prisma.user.findFirst({ where: { id } });
      if (!user) {
        return Err(RepoError.new("User not found", ErrorCause.ENTRY_NOT_FOUND));
      }

      return Ok(user);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        return Err(RepoError.new(e.message, ErrorCause.DATABASE_ERROR));
      }
      return Err(RepoError.new("Failed to find user: ".concat(e as string), ErrorCause.UNKNOWN_ERROR));
    }
  }

  async findMany(offset: number, limit: number): Promise<Result<User[], Merror>> {
    try {
      const users = await this.prisma.user.findMany({
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
      });

      if (users.length === 0) {
        return Err(RepoError.new("No users found", ErrorCause.ENTRY_NOT_FOUND));
      }

      return Ok(users);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        return Err(RepoError.new(e.message, ErrorCause.DATABASE_ERROR));
      }
      return Err(RepoError.new("Failed to find users: ".concat(e as string), ErrorCause.UNKNOWN_ERROR));
    }
  }

  async update(id: string, user: UserUpdateInput): Promise<Result<User, Merror>> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: { ...user },
      });
      return Ok(updatedUser);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          // Record not found
          return Err(RepoError.new("User not found", ErrorCause.ENTRY_NOT_FOUND));
        }
        return Err(RepoError.new(e.message, ErrorCause.DATABASE_ERROR));
      }
      return Err(RepoError.new("Failed to update user: ".concat(e as string), ErrorCause.UNKNOWN_ERROR));
    }
  }

  async delete(id: string): Promise<Merror> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return Merror.new(RepoError.new("User deleted successfully", ErrorCause.ENTRY_NOT_FOUND));
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          // Record not found
          return Merror.new(RepoError.new("User not found", ErrorCause.ENTRY_NOT_FOUND));
        }
        return Merror.new(RepoError.new(e.message, ErrorCause.DATABASE_ERROR));
      }
      return Merror.new(RepoError.new("Failed to delete user: ".concat(e as string), ErrorCause.UNKNOWN_ERROR));
    }
  }
}

export default UserRepository;
