import type { Response } from "express";

export interface HTTPResponse {
  data?: any;
  error?: string;
}

export function newHttpResponse(res: Response, code: number, body: HTTPResponse): void {
  res.sendStatus(code);
  res.json(body);
}
