import Koa from 'koa';
import { config as loadEnv } from 'dotenv';

import { bodyParser } from '@koa/bodyparser';
import injector from 'koa-tioc';
import router from './routes';

import depenencyProvider from './providers/di';

loadEnv();

const PORT: number = parseInt(process.env.SERVER_PORT ?? '8001');

const app = new Koa()
  .use(
    bodyParser({
      encoding: 'utf-8',
      onError: (_err, ctx) => ctx.throw(422, 'body parse error'),
    }),
  )
  .use(injector(depenencyProvider));

export type AppContext = (typeof app)['context'];

app
  .use(router.routes())
  .on('error', (err: Error, ctx: AppContext) => {
    const logger = ctx.container.resolve('logger');
    logger.error(`Server error on path ${ctx.method}:${ctx.path}`, err);
  })
  .listen(PORT, '0.0.0.0', () =>
    console.log(`Server "${process.env.SERVER_NAME}" started`),
  );

export default app;
