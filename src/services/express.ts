import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import { inject, injectable, multiInject } from "inversify";
import type { Logger } from "winston";

import { AppMiddleware } from "@/delivery/http/middleware";
import type { IHTTPRouter } from "@/types/http";
import { HTTPRouterSym } from "@/types/symbols";

import { ConfigService } from "./config";
import { LoggingService } from "./logger";

@injectable("Singleton")
export class ExpressService {
  private _express: Express = express();
  private _logger: Logger;

  constructor(
    @inject(ConfigService) private readonly _config: ConfigService,
    @inject(LoggingService) private readonly _loggerInstance: LoggingService,
    @multiInject(HTTPRouterSym) private readonly _httpRouters: IHTTPRouter[],
    @inject(AppMiddleware) private readonly _appMiddleware: AppMiddleware,
  ) {
    this._logger = this._loggerInstance.withLabel("ExpressService");

    this._express.use(cookieParser());
    this._express.use(cors({ origin: this._config.env.CORS_ORIGIN }));
    this._express.use(express.urlencoded({ extended: true }));
    this._express.use(express.json());

    this._express.use(this._appMiddleware.requestId, this._appMiddleware.httpLogger);

    // FIXME: tampilkan halaman dokumentasi
    this._express.get("/", (_, res) => {
      res.status(200).json({ hello: "world" });
    });

    this.registerRoutes();

    this._express.use(this._appMiddleware.errorHandling);
  }

  private registerRoutes(): void {
    for (const r of this._httpRouters) {
      this._logger.info(`registering route ${r.path}`);
      this._express.use(r.path, r.router);
    }
  }

  listen(): void {
    this._express.listen(this._config.env.APP_PORT, this._config.env.APP_HOST, () => {
      this._logger.info(`Express server started on http://${this._config.env.APP_HOST}:${this._config.env.APP_PORT}`);
    });
  }
}
