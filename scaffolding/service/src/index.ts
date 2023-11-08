import Koa from 'koa';
import router from './routes';
import cors from '@koa/cors';

const PORT: number = parseInt(process.env.SERVER_PORT ?? '3000');

const app = new Koa();

app.use(
  cors({
    origin(ctx) {
      const allowedOrigins = [];

      if (process.env.ALLOWED_ORIGIN)
        allowedOrigins.push(process.env.ALLOWED_ORIGIN);
      if (process.env.NODE_ENV === 'development')
        allowedOrigins.push('http://localhost:5200');

      if (!allowedOrigins.includes(ctx.origin)) return "";

      return ctx.origin;
    },
  }),
);

app.use(router.routes());

app
  .on('error', (err: Error, ctx: Koa.Context) => {
    //TODO: add logger instead of console.error
    console.error(
      `${new Date().toUTCString()} Server error on path ${ctx.method}:${
        ctx.path
      }`,
      err,
    );
  })
  .listen(PORT, '0.0.0.0', () => {
    const routes = router.stack
      .filter((r) => r.methods.length > 0)
      .map((r) => r.methods.join(', ') + ' @ ' + r.path);

    //TODO: change to logger
    console.log(
      `${new Date().toUTCString()} Server started with routes:\n\t- ${routes.join(
        '\n\t- ',
      )}`,
    );
  });
