import { Handler, Response } from 'express';
import CircuitBreaker from 'opossum';
import { Route, WebSocketRoute } from 'fast-gateway';

/**
 * Middleware to trigger a circuit breaker if the requests take too long. This middleware should be put on the route proxy itself.
 *
 */
const circuitBreaker = (opts?: CircuitBreaker.Options): Handler => {
  const breaker = new CircuitBreaker<[Response]>((res): Promise<void> => {
    return new Promise((resolve) => {
      res.on('close', () => {
        resolve();
      });
    });
  }, opts);

  breaker.fallback((res: Response, err: unknown) => {
    if (
      !err ||
      typeof err !== 'object' ||
      !('code' in err) ||
      err.code !== 'EOPENBREAKER'
    )
      return;

    if (res.writableFinished) return;

    res.statusCode = 503;
    res.statusMessage = 'Service Unavailable';
    res.end();
  });

  return async (_req, res, next) => {
    breaker.fire(res);
    await next();
  };
};

export const wrapWithCircuitBreaker = (
  routes: Array<Route | WebSocketRoute>,
  opts?: CircuitBreaker.Options,
): Array<Route | WebSocketRoute> => {
  return routes.map((route) => {
    if (route.proxyType !== 'websocket') {
      const breakerInstance = circuitBreaker(opts);
      const middlewares = route.middlewares ?? [];
      middlewares.push(breakerInstance);
      route.middlewares = middlewares;
    }

    return route;
  });
};

export default circuitBreaker;
