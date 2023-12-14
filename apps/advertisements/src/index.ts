import { config as loadEnv } from 'dotenv';
loadEnv();

import Koa from 'koa';

import injector from 'koa-tioc';
import { bodyParser } from '@koa/bodyparser';

import depenencyProvider from './providers/di';

import router from './routes';
import errorHandling from './middleware/errorHandling';
import requestLogger from './middleware/requestLogger';
import IoCContainer from 'tioc';

const PORT: number = parseInt(process.env.SERVER_PORT ?? '8001');

const app = new Koa()
  .use(injector(depenencyProvider))
  .use(errorHandling())
  .use(requestLogger())
  .use(
    bodyParser({
      encoding: 'utf-8',
      onError: (_err, ctx) => ctx.throw(422, 'body parse error'),
    }),
  );

export type AppContext = (typeof app)['context'];

const initContainer = depenencyProvider(new IoCContainer());
initContainer.resolve('broker').then(async () => {
  console.log('Broker started');
  initContainer.resolve('UsersSubscription').then((s) => s.listen());
});

app
  .use(router.routes())
  .listen(PORT, '0.0.0.0', () =>
    console.log(
      `Server "${process.env.SERVER_NAME}" started on localhost:${PORT}`,
    ),
  );

export default app;
