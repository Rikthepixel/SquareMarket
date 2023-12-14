import { z } from 'zod';
import makeRouter, { AppRouter } from '../../helpers/router';
import { AuthState } from '../../middleware/auth';
import validate from '../../middleware/validate';
import { advertisementCreatedResponse } from '../../responses/manage/AdvertisementCreationResponse';

const manageRouter = makeRouter<object, AuthState>();

manageRouter
  .use((ctx, next) => ctx.container.resolve('authMiddleware')(ctx, next))
  .post(
    'Create advertisement',
    '/create',
    validate({
      response: advertisementCreatedResponse,
    }),
    async (ctx) => {
      const adService = ctx.container.resolve('AdvertisementService');
      ctx.status = 200;
      ctx.body = {
        uid: await adService.create(ctx.state.user.sub),
      };
    },
  )
  .get(
    'Get published advertisements for the authenticated user',
    '/published',
    async (ctx) => {
      const adService = ctx.container.resolve('AdvertisementService');
      ctx.status = 200;
      ctx.body = await adService
        .getPublishedByUser(ctx.state.user.sub)
        .catch((e) => ctx.throw(e));
    },
  )
  .get(
    'Get draft advertisement for the authenticated user',
    '/drafts',
    async (ctx) => {
      const adService = ctx.container.resolve('AdvertisementService');
      ctx.status = 200;
      ctx.body = await adService
        .getDraftsByUser(ctx.state.user.sub)
        .catch((e) => ctx.throw(e));
    },
  )
  .get(
    'Get advertisement',
    '/:uid',
    validate({ params: z.object({ uid: z.string() }) }),
    async (ctx) => {
      const adService = ctx.container.resolve('AdvertisementService');
      ctx.status = 200;
      ctx.body = await adService.get(ctx.validated.params.uid);
    },
  );

export default manageRouter as AppRouter;
