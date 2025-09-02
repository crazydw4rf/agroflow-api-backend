import { Router } from "express";
import { inject, injectable } from "inversify";

import { zLoginUser } from "@/models";
import type { IHTTPRouter } from "@/types/http";

import { AuthController } from "../controller";
import { AppMiddleware, AuthMiddleware } from "../middleware";
import RouterPaths from "../path";

@injectable("Singleton")
export class AuthRouter implements IHTTPRouter {
  path = RouterPaths.AUTH;
  router = Router();

  constructor(
    @inject(AuthMiddleware) private readonly _authMw: AuthMiddleware,
    @inject(AppMiddleware) private readonly _appMw: AppMiddleware,
    @inject(AuthController) private readonly _authController: AuthController,
  ) {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post("/login", this._appMw.validatePayload(zLoginUser), this._authController.loginUser);
    this.router.post("/logout", this._authController.logoutUser);
    this.router.post("/refresh", this._authMw.verifyRefreshJWT, this._authController.refreshToken);
  }
}
