import { TOKEN } from './cookies';
import { Request, Response } from 'express';

export type GraphqlContext = ReturnType<typeof context>;

export function context({ req, res }: { req: Request; res: Response }) {
  /*
  token
  */
  const token: string = req.cookies && req.cookies[TOKEN];

  //base context that we'll be passing to dataloader factory functions
  //aka - the overlap GraphqlContext has with the Service Context
  const ctx = { token };

  return {
    ...ctx,
    res,
  };
}
