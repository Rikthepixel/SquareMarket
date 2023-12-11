import makeRouter from '../../helpers/router';
import { AuthState } from '../../middleware/auth';
import validate from '../../middleware/validate';
import { createAdvertisementRequestSchema } from '../../requests/manage/CreateAdvertisementRequest';

const manageRouter = makeRouter<object, AuthState>();

manageRouter
  .use((ctx, next) => ctx.container.resolve('authMiddleware')(ctx, next))
  .post(
    'Create advertisement',
    '/create',
    validate({
      body: createAdvertisementRequestSchema,
    }),
    async (ctx) => {
      const adService = ctx.container.resolve('AdvertisementService');
      adService.create({
        ...ctx.validated.body,
        user_uid: ctx.state.user.sub,
      });
      ctx.status = 200;
    },
  );

export default manageRouter;
