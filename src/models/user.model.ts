import zod from "zod/v4";

import type { User } from "@/entity";
import type { AnyProps } from "@/types/helper";

export const zCreateUser = zod.object({
  name: zod.string(),
  email: zod.email(),
  password: zod.string().min(8),
} satisfies AnyProps<User>);

export const zLoginUser = zCreateUser.pick({ email: true, password: true })

export type UserRegisterRequest = zod.infer<typeof zCreateUser>;

export type UserLoginRequest = zod.infer<typeof zLoginUser>;

