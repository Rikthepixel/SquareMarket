import validate from '../../middleware/validate';
import KoaRouter from '@koa/router';
import { z } from 'zod';

const healthRouter = new KoaRouter();

healthRouter.get(
  'Health',
  '/',
  validate({
    response: z.object({
      online: z.boolean(),
      status: z.string(),
    }),
  }),
  async (ctx) => {
    console.log("Test")
    ctx.body = {
      online: true,
      status: 'available',
    };
  },
);

export default healthRouter;
