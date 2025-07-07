import type Merror from "@/utils/merror";

import type { ErrorObject } from "./errors";
import type { Result } from "./helper";

export interface BaseDatabaseRepositoryInterface<T, R extends ErrorObject> {
  create(entity: T): Promise<Result<T, Merror<R>>>;
  find(id: string): Promise<Result<T, Merror<R>>>;
  update(id: string, entity: Partial<T>): Promise<Result<T, Merror<R>>>;
  delete(id: string): Promise<Merror<R>>;
}
