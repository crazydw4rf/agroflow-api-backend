import type { User } from "./entity";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      DATABASE_URL: string;
      APP_HOST?: string;
      APP_PORT?: string;
    }
  }

  namespace Express {
    interface Locals {
      user: User;
    }
  }
}

export {};
