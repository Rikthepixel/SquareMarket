import { Request, Response, NextFunction } from 'express';
import requestIp from 'request-ip';
import rateLimit, { Options } from 'express-rate-limit';

declare module 'express' {
  interface Request {
    ip: string | undefined;
  }
}

export interface RateLimiterOptions extends Options {
  trustProxy?: boolean;
}

const rateLimiter = (opts?: Partial<RateLimiterOptions>) => {
  const limiter = rateLimit(opts);
  return (req: Request, res: Response, next: NextFunction) => {
    req.ip = requestIp.getClientIp(req) as string | undefined;

    req.app = {} as typeof req.app;
    req.app.get = ((key: string): any => {
      if (key === "trust proxy") {
        return Boolean(opts?.trustProxy)
      }
      return "unimplemented";
    }) as unknown as typeof req.app.get;

    limiter(req, res, next);
    return next();
  };
};
export default rateLimiter;
