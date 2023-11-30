import { z } from 'zod';
import validate from '../../middleware/validate';
import makeRouter from '../../helpers/router';

const healthRouter = makeRouter();

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
    ctx.body = {
      online: true,
      status: 'available',
    };
  },
);

export default healthRouter;
