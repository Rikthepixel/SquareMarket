import { z } from 'zod';
import makeRouter from '../../helpers/router';
import validate from '../../middleware/validate';
import categoriesRouter from './categories';
import healthRouter from './health';
import manageRouter from './manage';

const v1Router = makeRouter();

v1Router.get(
  'Get filtered advertisements',
  '/filter',
  validate({
    query: z.object({
      cat: z.string().optional(),
      po: z
        .string()
        .optional()
        .transform((opts) =>
          opts ? z.string().array().parse(opts.split(',')) : undefined,
        ),
    }),
  }),
  async (ctx) => {
    const adService = ctx.container.resolve('AdvertisementService');
    ctx.status = 200;
    ctx.body = await adService.getFiltered({
      category: ctx.validated.query.cat,
      propertyOptions: ctx.validated.query.po,
    });
  },
);
v1Router.use(healthRouter.prefix('/health').routes());
v1Router.use(manageRouter.prefix('/manage').routes());
v1Router.use(categoriesRouter.prefix('/categories').routes());

export default v1Router;
