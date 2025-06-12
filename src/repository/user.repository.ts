import type { User, PrismaClient } from "@/generated/prisma/client";

export interface IUserRepository {
  create(user: User): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  deleteById(id: string): Promise<void>;
}

class UserRepository implements IUserRepository {
  private readonly db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  async create(user: User): Promise<User> {
    const createdUser = await this.db.user.create({
      data: user,
    });

    return createdUser;
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    const updatedUser = await this.db.user.update({
      where: { id },
      data: { ...user },
    });

    return updatedUser;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.db.user.findFirst({
      where: { id },
    });

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db.user.findFirst({
      where: { email },
    });

    return user;
  }

  async deleteById(id: string): Promise<void> {
    try {
      await this.db.user.delete({
        where: { id },
      });
    } catch (e) {
      throw new Error(`Failed to delete user with id ${id}: ${e}`);
    }
  }
}

export default UserRepository;
