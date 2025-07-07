import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { inject, injectable } from "inversify";

import { zCreateUser } from "@/models";
import { ErrorCause, RepoError } from "@/types/errors";
import { newHttpResponse } from "@/types/http";
import { type IUserUsecase, UserUsecase } from "@/usecase/user.usecase";

export interface IUserController {
  registerUser(res: Response, req: Request): Promise<void>;
}

@injectable("Singleton")
export class UserController implements IUserController {
  constructor(@inject(UserUsecase) private userUc: IUserUsecase) {}

  async registerUser(res: Response, req: Request): Promise<void> {
    const parsed = zCreateUser.safeParse(req.body);
    if (!parsed.success) {
      newHttpResponse(res, StatusCodes.BAD_REQUEST, { error: parsed.error.message });
      return;
    }

    // FIXME: Refactor error handling to use a function that checks the error types
    const { ok: result, err } = await this.userUc.registerUser(parsed.data);
    if (err) {
      const repoErr = err.as(RepoError);
      if (repoErr) {
        switch (repoErr.error.cause) {
          case ErrorCause.DUPLICATE_ENTRY:
            newHttpResponse(res, StatusCodes.CONFLICT, { error: repoErr.message });
            return;
          case ErrorCause.ENTRY_NOT_FOUND:
            newHttpResponse(res, StatusCodes.NOT_FOUND, { error: repoErr.message });
            return;
          case ErrorCause.DATABASE_ERROR:
            newHttpResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { error: repoErr.message });
            return;
          default:
            newHttpResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { error: "An unexpected error occurred." });
            return;
        }
      }
      newHttpResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, { error: "An unexpected error occurred." });
      return;
    }

    newHttpResponse(res, StatusCodes.CREATED, { data: result });
  }
}
