import type { NextFunction, Request, Response } from "express";
import type { ZodObject } from "zod/v4";

import { AppError, ErrorCause } from "@/types/errors";

type ExpressFunctionHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function ValidatePayload(z: ZodObject): MethodDecorator {
  // @ts-expect-error: Gak tau dah typescript bilang error mulu disini
  return function (
    _target: object,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<ExpressFunctionHandler>,
  ): void {
    const func = descriptor.value!;

    descriptor.value = async function (req, res, next) {
      try {
        req.body = z.parse(req.body);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
      } catch (e) {
        throw AppError.new("validation error", ErrorCause.VALIDATION_ERROR);
      }

      await func.apply(this, [req, res, next]);
    };
  };
}

// TODO: buat decorator untuk validasi req.params dan req.query

// TODO: buat decorator untuk validasi dan verifikasi jwt token

