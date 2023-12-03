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
    const service = ctx.container.resolve('AdvertisementService');
    const logger = ctx.container.resolve('logger');


    console.log('Run');
    const ads = await service.getPublicAdvertisements();
    logger.info('ads', ads);
    ctx.status = 200;
    ctx.body = {
      online: true,
      status: 'available',
    };
  },
);

export default healthRouter;
