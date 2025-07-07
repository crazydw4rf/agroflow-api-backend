export interface ErrorProps<T> {
  error: T;
  message?: string;
}

// Generic?
export class Merror {
  private _errorList: ErrorProps<Error>[] = [];
  private _errorCount = 0;

  constructor(error: Error) {
    this._errorList = [{ error }];
    this._errorCount = 1;
  }

  static new(err: Error): Merror {
    return new Merror(err);
  }

  wrap(error: Error, message?: string): this {
    this._errorList.push({ error, message });
    this._errorCount++;

    return this;
  }

  is(error: any): boolean {
    for (const e of this._errorList) {
      if (e.error instanceof error) {
        return true;
      }
    }

    return false;
  }

  as<P extends Error>(errorClass: new (...args: any[]) => P): ErrorProps<P> | undefined {
    for (const e of this._errorList) {
      if (e.error instanceof errorClass) {
        return e as unknown as ErrorProps<P>;
      }
    }
  }

  get root(): ErrorProps<Error> | undefined {
    return this._errorList[0];
  }

  get latestMessage(): string | undefined {
    return this._errorList[this._errorCount - 1]?.message;
  }

  get latestError(): Error | undefined {
    return this._errorList[this._errorCount - 1]?.error;
  }
}

export default Merror;
