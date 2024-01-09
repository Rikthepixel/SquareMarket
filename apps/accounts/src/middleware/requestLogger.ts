import Koa from 'koa';
import { InjectorContext } from 'koa-tioc';
import IoCContainer from 'tioc';
import BaseLogger from '../loggers/BaseLogger';

export default function requestLogger() {
  return async function (
    ctx: Koa.Context & InjectorContext<IoCContainer<{ logger: BaseLogger }>>,
    next: Koa.Next,
  ) {
    const logger = ctx.container.resolve('logger');
    logger.info(`Request to '${ctx.url}' from ${ctx.origin}`);
    await next();
  };
}
