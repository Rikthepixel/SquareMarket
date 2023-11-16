import { AuthOptions, auth as makeAuth } from 'express-oauth2-jwt-bearer';
import { Request, Response, NextFunction } from 'express';
import { Request as RestanaRequest, Protocol } from "restana";
import typeIs from 'type-is';

const auth = (opts?: AuthOptions) => {
  const middleware = makeAuth(opts);

  return (req: RestanaRequest<Protocol.HTTP>, res: Response, next: NextFunction) => {
    const strappedReq = req as unknown as Request;

    strappedReq.is = (type) => {
      return typeIs(req, Array.isArray(type) ? type : [type]);
    };

    middleware(strappedReq, res, next);
  }
}

export default auth;
