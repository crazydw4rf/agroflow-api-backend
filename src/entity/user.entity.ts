import type { User } from "@/generated/prisma";

export type { User } from "@/generated/prisma";

export type UserWithToken = User & { token: string };
