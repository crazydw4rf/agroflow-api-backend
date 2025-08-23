import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import { Container } from "inversify";
import type { Logger } from "winston";

import { AuthController, UserController } from "@/delivery/http/controller";
import { AppMiddleware, AuthMiddleware } from "@/delivery/http/middleware";
import { AuthRouter, UserRouter } from "@/delivery/http/router";
import { PrismaClient } from "@/generated/prisma/client";
import { UserRepository } from "@/repository";
import { ExpressService } from "@/services/express";
import { LoggingService } from "@/services/logger";
import type { IHTTPRouter } from "@/types/http";
import { HTTPRouterSym, UserModelSym } from "@/types/symbols";
import { AuthUsecase, UserUsecase } from "@/usecase";

import { ConfigService } from "./services/config";

async function initDatabase(log: Logger): Promise<PrismaClient> {
  const db = new PrismaClient();
  try {
    await db.$connect();
    return db;
  } catch (e) {
    if (e instanceof PrismaClientInitializationError) {
      log.error("Failed to connect to the database. Please check your database connection settings.", {
        message: e.message,
      });
      process.exit(1);
    }

    log.error("An unexpected error occurred while connecting to the database.", e as object);
    process.exit(1);
  }
}

function registerModels(c: Container, db: PrismaClient): void {
  c.bind(UserModelSym).toConstantValue(db.user);
}

function registerAppServices(c: Container): void {
  c.bind(UserController).toSelf();
  c.bind(UserUsecase).toSelf();
  c.bind(UserRepository).toSelf();

  c.bind(AuthController).toSelf();
  c.bind(AuthUsecase).toSelf();

  c.bind(AppMiddleware).toSelf();
  c.bind(AuthMiddleware).toSelf();

  c.bind(ExpressService).toSelf();

  c.bind<IHTTPRouter>(HTTPRouterSym).to(UserRouter);
  c.bind<IHTTPRouter>(HTTPRouterSym).to(AuthRouter);
}

function registerCoreService(c: Container): void {
  c.bind(LoggingService).toSelf();
  c.bind(ConfigService).toSelf();
}

async function bootstrap(): Promise<void> {
  const container = new Container();
  registerCoreService(container);
  registerAppServices(container);

  const log = container.get(LoggingService).withLabel("BOOTSTRAP");
  log.info("Starting application...");

  log.info("Initializing database connection...");
  const db = await initDatabase(log);

  log.info("Initializing models...");
  registerModels(container, db);

  const app = container.get(ExpressService);
  log.info("Listening for incoming requests...");
  app.listen();
}

await bootstrap();
