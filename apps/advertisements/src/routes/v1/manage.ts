import { z } from 'zod';
import makeRouter, { AppRouter } from '../../helpers/router';
import { AuthState } from '../../middleware/auth';
import validate from '../../middleware/validate';
import { advertisementCreatedResponse } from '../../responses/manage/AdvertisementCreationResponse';
import { putAdvertisementRequest } from '../../requests/manage/PutAdvertisementRequest';
import multer from '@koa/multer';

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
  )
  .put(
    'Put advertisement',
    '/:uid',
    validate({
      params: z.object({ uid: z.string().uuid() }),
      body: putAdvertisementRequest,
    }),
    async (ctx) => {
      const { params, body } = ctx.validated;
      const adService = ctx.container.resolve('AdvertisementService');

      await adService.put(params.uid, {
        title: body.title,
        description: body.description,
        price: body.price,
        currency: body.currency,
        category_uid: body.category,
        propertyValues: body.propertyValues,
        images: body.images ?? [],
        draft: !body.published,
      });
      ctx.status = 200;
    },
  )
  .delete(
    'Delete advertisement',
    '/:uid',
    validate({
      params: z.object({ uid: z.string().uuid() }),
    }),
    async (ctx) => {
      const { params } = ctx.validated;
      const adService = ctx.container.resolve('AdvertisementService');
      await adService.delete(params.uid);
      ctx.status = 200;
    },
  )
  .delete(
    'Unpublish advertisement',
    '/:uid/unpublish',
    validate({
      params: z.object({ uid: z.string().uuid() }),
    }),
    async (ctx) => {
      const { params } = ctx.validated;
      const adService = ctx.container.resolve('AdvertisementService');
      await adService.unpublish(params.uid);
      ctx.status = 200;
    },
  )
  .post(
    'Add images',
    '/:uid/images',
    multer({ limits: { fileSize: 10_000_000 } }).array('image'),
    validate({
      params: z.object({ uid: z.string().uuid() }),
      images: [
        {
          field: 'image',
          types: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'],
        },
      ],
    }),
    async (ctx) => {
      const { params, images } = ctx.validated;
      const adService = ctx.container.resolve('AdvertisementService');
      ctx.status = 200;
      ctx.body = await adService.addImages(
        params.uid,
        images.map((file) => ({
          content: file.buffer,
          mime: file.mimetype,
        })),
      );
    },
  );

export default manageRouter as AppRouter;
