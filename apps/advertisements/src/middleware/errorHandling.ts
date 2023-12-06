import Koa, { HttpError } from 'koa';
import { InjectorContext } from 'koa-tioc';
import IoCContainer from 'tioc';
import BaseLogger from '../loggers/BaseLogger';

export default function errorHandling() {
  return async (
    ctx: Koa.Context & InjectorContext<IoCContainer<{ logger: BaseLogger }>>,
    next: Koa.Next,
  ) => {
    try {
      await next();
    } catch (error) {
      if (!(error instanceof HttpError)) {
        const logger = ctx.container.resolve('logger');
        logger.error(`Server error on path ${ctx.method}:${ctx.path}`, error);

        ctx.status = 500;
        ctx.message = 'Internal server error';
        return ctx;
      }
      ctx.status = error.status;
      ctx.body = error.message;
    }
  };
}
