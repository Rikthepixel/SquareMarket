import { AuthOptions, auth as makeAuth } from 'express-oauth2-jwt-bearer';
import { Request, Response, NextFunction } from 'express';
import { Request as RestanaRequest, Protocol } from "restana";
import typeIs from 'type-is';

export AuthOptions;

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

export const wrapWithAuth = (
  routes: Array<Route | WebSocketRoute>,
  opts?: CircuitBreaker.Options,
): Array<Route | WebSocketRoute> => {
  return routes.map((route) => {
    if (route.proxyType !== 'websocket') {
      const breakerInstance = auth(opts);
      const middlewares = route.middlewares ?? [];
      middlewares.push(breakerInstance);
      route.middlewares = middlewares;
    }

    return route;
  });
};

export default auth;
