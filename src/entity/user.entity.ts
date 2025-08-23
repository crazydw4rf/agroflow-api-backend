import type { User } from "@/generated/prisma/client";

export type { User } from "@/generated/prisma/client";

export type UserWithToken = User & { accessToken: string; refreshToken: string };
