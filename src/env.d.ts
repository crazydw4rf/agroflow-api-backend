declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      DATABASE_URL: string;
      APP_HOST?: string;
      APP_PORT?: string;
    }
  }
}

export {};
