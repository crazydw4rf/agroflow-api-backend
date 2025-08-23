import { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import zod from "zod/v4";

import type { User } from "@/entity";
import type { AnyProps } from "@/types/helper";

export type UserModel = Prisma.UserDelegate<DefaultArgs, Prisma.PrismaClientOptions>;

export const zCreateUser = zod.object({
  name: zod.string().regex(/^(?!.*[\p{Emoji}\d]).*$/u, "user name must not contain emojis or numbers"),
  email: zod.email("email must be a valid email address"),
  password: zod.string().min(8, "password must be at least 8 characters long"),
} satisfies AnyProps<User>);

export const zLoginUser = zCreateUser.pick({ email: true, password: true });

export type UserRegisterDto = zod.infer<typeof zCreateUser>;

export type UserLoginDto = zod.infer<typeof zLoginUser>;
