import type { Request, Response } from "express";

type RequestParams = {
  userId: string;
  projectId: string;
  farmId: string;
};

type Locals = {
  user: {
    id: string;
    role: string;
  };
};

export type ExtendedRequest = Request<RequestParams>;

export type ExtendedResponse = Response<any, Locals>;
