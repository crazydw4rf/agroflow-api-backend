import dotenv from "dotenv";
import { injectable } from "inversify";
import type { SignOptions } from "jsonwebtoken"
import zod from "zod/v4";

const zEnvConfig = zod.object({
  APP_HOST: zod.string().default("localhost"),
  APP_PORT: zod.coerce.number().default(3000),
  JWT_SECRET: zod.string(),
  DOMAIN_NAME: zod.string().default("example.com"),
})

const defaultAppConfig = {
  jwt: {
    algorithm: "HS256",
    expiresIn: "1w",
  } satisfies SignOptions,
}

@injectable("Singleton")
export class ConfigService {
  private _env!: zod.infer<typeof zEnvConfig>;

  constructor() {
    this.loadEnv();
    this.parseEnv();
  }

  protected loadEnv(): void {
    dotenv.config()
  }

  protected parseEnv(): void {
    const parsed = zEnvConfig.safeParse(process.env);
    if (!parsed.success) {
      throw new Error("Failed to parse environment variables: " + parsed.error.message);
    }

    this._env = parsed.data;
  }

  get env(): zod.infer<typeof zEnvConfig> {
    return this._env;
  }

  get app(): typeof defaultAppConfig {
    return defaultAppConfig
  }
}

