import express, { type Router } from "express";
import { inject, injectable } from "inversify";

import { UserController } from "@/delivery/http/controller";

@injectable("Singleton")
export class HTTPRouter {
  public userRouter: Router = express.Router();

  constructor(
    @inject(UserController) private readonly _userCtrl: UserController
  ) {
    this.setupUserRoutes();
  }

  protected setupUserRoutes(): void {
    this.userRouter.post("/register", this._userCtrl.registerUser)
    this.userRouter.post("/login", this._userCtrl.loginUser)
  }
}
