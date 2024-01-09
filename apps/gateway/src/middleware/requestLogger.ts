import { Response, NextFunction } from 'express';
import { Request as RestanaRequest, Protocol } from 'restana';

const requestLogger = () => {
  return (
    req: RestanaRequest<Protocol.HTTP>,
    _: Response,
    next: NextFunction,
  ) => {
    console.log(`Request to '${req.originalUrl}' from ${req.headers.origin}`);
    req.originalUrl;
    next();
  };
};

export default requestLogger;
