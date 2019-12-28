import { Request } from "express";

export type GraphqlContext = ReturnType<typeof context>;

export function context({ req }: { req: Request }) {
  /*
  token
  */
  const token = req.headers["x-token"]
    ? req.headers["x-token"]
    : req.cookies
    ? req.cookies["accessToken"]
    : undefined;

  //base context that we'll be passing to dataloader factory functions
  //aka - the overlap GraphqlContext has with the Service Context
  const ctx = { token };

  return {
    ...ctx
  };
}
