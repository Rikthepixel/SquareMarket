import { z } from 'zod';
import makeRouter from '../../helpers/router';
import validate from '../../middleware/validate';
import categoriesRouter from './categories';
import healthRouter from './health';
import manageRouter from './manage';
import NotFoundException from '../../exceptions/common/NotFound';

const v1Router = makeRouter();

v1Router.use(healthRouter.prefix('/health').routes());
v1Router.use(manageRouter.prefix('/manage').routes());
v1Router.use(categoriesRouter.prefix('/categories').routes());

v1Router
  .get(
    'Get filtered advertisements',
    '/filter',
    validate({
      query: z.object({
        search: z.string().optional(),
        cat: z.string().uuid().optional(),
        po: z
          .string()
          .optional()
          .transform((opts) =>
            opts ? z.string().uuid().array().parse(opts.split(',')) : undefined,
          ),
      }),
    }),
    async (ctx) => {
      const adService = ctx.container.resolve('AdvertisementService');
      ctx.status = 200;
      ctx.body = await adService.getFiltered({
        content: ctx.validated.query.search,
        category: ctx.validated.query.cat,
        propertyOptions: ctx.validated.query.po,
      });
    },
  )
  .get(
    'Get public advertisement',
    '/:uid',
    validate({ params: z.object({ uid: z.string().uuid() }) }),
    async (ctx) => {
      const adService = ctx.container.resolve('AdvertisementService');
      ctx.status = 200;
      ctx.body = await adService.get(ctx.validated.params.uid).then((ad) => {
        if (!ad.published_at) throw new NotFoundException('advertisement');
        return ad;
      });
    },
  )
  .get(
    'Get advertisement image',
    '/images/:uid',
    validate({ params: z.object({ uid: z.string().uuid() }) }),
    async (ctx) => {
      const imageService = ctx.container.resolve('ImageService');
      ctx.status = 200;
      const file = await imageService.getContent(ctx.validated.params.uid);
      ctx.body = file.content;
      ctx.set('Content-Type', file.mime);
    },
  );

export default v1Router;
