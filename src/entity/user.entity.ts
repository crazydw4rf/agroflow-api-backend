import type { User } from "@/generated/prisma";

export type { User } from "@/generated/prisma";

export type UserWithoutPassword = Omit<User, "password">;
