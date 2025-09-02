import express from "express";
import { inject, injectable } from "inversify";

import { zCreateUser } from "@/models";
import type { IHTTPRouter } from "@/types/http";

import { UserController } from "../controller";
import { AppMiddleware, AuthMiddleware } from "../middleware";
import RouterPaths from "../path";

@injectable("Singleton")
export class UserRouter implements IHTTPRouter {
  path = RouterPaths.USER;
  router = express.Router();

  constructor(
    @inject(UserController) private readonly _userCtrl: UserController,
    @inject(AppMiddleware) private readonly _appMw: AppMiddleware,
    @inject(AuthMiddleware) private readonly _authMw: AuthMiddleware,
  ) {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post("/register", this._appMw.validatePayload(zCreateUser), this._userCtrl.registerUser);
    this.router.get("/me", this._authMw.verifyJWT, this._userCtrl.me);
  }
}
