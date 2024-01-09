import { z } from 'zod';
import makeRouter from '../../helpers/router';
import validate from '../../middleware/validate';

const categoriesRouter = makeRouter();

categoriesRouter
  .get('Get all categories', '/', async (ctx) => {
    const categoryService = ctx.container.resolve('CategoryService');
    ctx.status = 200;
    ctx.body = await categoryService.getAll().catch((e) => ctx.throw(e));
  })
  .get(
    'Get category',
    '/:uid',
    validate({ params: z.object({ uid: z.string() }) }),
    async (ctx) => {
      const categoryService = ctx.container.resolve('CategoryService');
      ctx.status = 200;
      ctx.body = await categoryService.getWithProperties(
        ctx.validated.params.uid,
      );
    },
  );

export default categoriesRouter;
