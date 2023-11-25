import { Request, Response, NextFunction } from 'express';
import { Request as RestanaRequest, Protocol } from 'restana';
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
  return (req: RestanaRequest<Protocol.HTTP>, res: Response, next: NextFunction) => {
    const strappedRequest = req as unknown as Request;
    strappedRequest.ip = requestIp.getClientIp(req) as string | undefined;

    strappedRequest.app = {} as Request["app"];
    strappedRequest.app.get = ((key: string) => {
      if (key === "trust proxy") {
        return Boolean(opts?.trustProxy)
      }
      return "unimplemented";
    }) as unknown as Request["app"]["get"];

    limiter(strappedRequest, res, next);
    return next();
  };
};
export default rateLimiter;
