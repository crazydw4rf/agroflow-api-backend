/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { inject, injectable } from "inversify";
import { Format } from "logform";
import { createLogger, format, Logger, transports } from "winston";

import { ConfigService } from "./config";

// TODO: add winston-loki transport
// output to console or file?
@injectable("Singleton")
export class LoggingService {
  private _logger: Logger;

  constructor(@inject(ConfigService) private readonly config: ConfigService) {
    this._logger = createLogger({
      level: this.config.env.APP_ENV === "production" ? "info" : "debug",
      transports: [new transports.Console()],
      format: this.setLogFormat(),
    });
  }

  info(message: string, meta?: Record<string, any>): void {
    this._logger.info(message, meta);
  }

  warn(message: string, meta?: Record<string, any>): void {
    this._logger.warn(message, meta);
  }

  error(message: string, meta?: Record<string, any>): void {
    this._logger.error(message, meta);
  }

  debug(message: string, meta?: Record<string, any>): void {
    this._logger.debug(message, meta);
  }

  withLabel(label: string): Logger {
    return this._logger.child({ label });
  }

  private setLogFormat(): Format {
    if (this.config.env.APP_ENV === "production") {
      return format.json();
    }

    return format.combine(
      format.colorize(),
      format.timestamp(),
      format.printf((t): string => {
        const { level, message, timestamp, ...restProps } = t;

        return `${timestamp} [${level}]: ${message}\n${Object.entries(restProps)
          .map(([key, value]) => `  ${key}: ${value}`)
          .join("\n")}`;
      }),
    );
  }
}
