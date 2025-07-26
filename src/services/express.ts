import express, { type Express } from "express"
import { inject, injectable } from "inversify";

import { HTTPRouter } from "@/delivery/http/router";

import { ConfigService } from "./config";

const BASE_PATH = "/api/v1",
  USER_PATH = `${BASE_PATH}/user`;

@injectable("Singleton")
export class ExpressService {
  private _express: Express = express();
  constructor(
    @inject(ConfigService) private readonly _config: ConfigService,
    @inject(HTTPRouter) private readonly _httpRouter: HTTPRouter
  ) {
    this._express.use(express.json());
    this._express.use(express.urlencoded({ extended: true }));

    this.registerRoutes();
  }

  protected registerRoutes(): void {
    this._express.use(USER_PATH, this._httpRouter.userRouter);
  }

  listen(): void {
    this._express.listen(this._config.env.APP_PORT, this._config.env.APP_HOST, () => {
      console.log(`Express server started on http://${this._config.env.APP_HOST}:${this._config.env.APP_PORT}`);
    })
  }
}

