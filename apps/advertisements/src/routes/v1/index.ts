import KoaRouter from '@koa/router';
import healthRouter from './health';
import { AppContext } from '../..';

const v1Router = new KoaRouter<object, AppContext>();

v1Router.use(healthRouter.prefix('/health').routes());
v1Router.get('get advertisements', '/', (ctx) => {
  ctx.container.resolve('AdvertisementService');
});

export default v1Router;
