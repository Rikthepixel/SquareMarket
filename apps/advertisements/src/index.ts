import Koa from 'koa';
import { config as loadEnv } from 'dotenv';

import injector from 'koa-tioc';
import { bodyParser } from '@koa/bodyparser';

import depenencyProvider from './providers/di';

import router from './routes';
import errorHandling from './middleware/errorHandling';
// import requestLogger from './middleware/requestLogger';

loadEnv();

const PORT: number = parseInt(process.env.SERVER_PORT ?? '8001');

const app = new Koa()
  .use(injector(depenencyProvider))
  .use(errorHandling())
  .use(async function (ctx, next: Koa.Next) {
    // const logger = ctx.container.resolve('logger');
    // logger.info(`Request to '${ctx.url}' from ${ctx.origin}`);
    await next();
    console.log(ctx);
  })
  .use(
    bodyParser({
      encoding: 'utf-8',
      onError: (_err, ctx) => ctx.throw(422, 'body parse error'),
    }),
  );

export type AppContext = (typeof app)['context'];

app
  .use(router.routes())
  .listen(PORT, '0.0.0.0', () =>
    console.log(
      `Server "${process.env.SERVER_NAME}" started on localhost:${PORT}`,
    ),
  );

export default app;
