import { withAccelerate } from "@prisma/extension-accelerate";
import { inject, injectable } from "inversify";
import type { Logger } from "winston";

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaClientKnownRequestError } from "@/generated/prisma/internal/prismaNamespace";

import { ConfigService } from "./config";
import { LoggingService } from "./logger";

@injectable("Singleton")
export default class PrismaService extends PrismaClient {
  private _logger: Logger;

  constructor(
    @inject(LoggingService) private readonly _loggerInstance: LoggingService,
    @inject(ConfigService) private readonly _config: ConfigService,
  ) {
    super();

    this._logger = this._loggerInstance.withLabel("PrismaService");

    if (this._config.env.DATABASE_ACCELERATE) {
      this._logger.info("prisma accelerate is enabled.");
      Object.assign(this, this.$extends(withAccelerate()));
    }

    this.tryConnect();
  }

  tryConnect(): void {
    this._logger.info("attempting to connect to the database...");

    this.$queryRaw`SELECT 1`.catch((e) => {
      if (e instanceof PrismaClientKnownRequestError) {
        this._logger.error("failed to connect to the database. Please check your database connection settings.", {
          message: e.message,
        });
        process.exit(1);
      }

      this._logger.error("an unexpected error occurred while connecting to the database.", e as object);
      process.exit(1);
    });

    this._logger.info("successfully connected to the database.");
  }
}
