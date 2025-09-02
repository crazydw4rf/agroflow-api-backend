import z from "zod/v4";

import type { Project } from "@/entity";
import type { ZodPartial } from "@/types/helper";

export type { ProjectDelegate as ProjectModel } from "@/generated/prisma/models";

export const zProjectCreate = z.object({
  project_name: z.string().regex(/^(?!.*[\p{Emoji}]).*$/u, "project name cannot contain emojis"),
  budget: z.number().min(0, "budget must be a non-negative number"),
  project_status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED"]).default("PLANNING"),
  start_date: z.date().default(() => new Date()),
  target_date: z.date(),
} satisfies ZodPartial<Project>);

export const zProjectUpdate = zProjectCreate.extend({ user_id: z.ulid() });

export type ProjectCreateDto = z.infer<typeof zProjectCreate>;

export type ProjectUpdateDto = z.infer<typeof zProjectUpdate>;
