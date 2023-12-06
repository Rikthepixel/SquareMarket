import ProfileAlreadyCompleteException from '../../exceptions/self/ProfileAlreadyComplete';
import { catchType } from '../../helpers/catch';
import makeAppRouter, { AppRouter } from '../../helpers/router';
import { AuthState } from '../../middleware/auth';
import validate from '../../middleware/validate';
import { finishProfileRequestSchema } from '../../requests/self/FinishProfileRequest';
import { profileStatusResponseSchema } from '../../responses/self/ProfileStatusResponse';

const selfRouter = makeAppRouter<object, AuthState>();

selfRouter
  .use((ctx, next) => ctx.container.resolve('authMiddleware')(ctx, next))
  .get(
    'Profile status',
    '/status',
    validate({ response: profileStatusResponseSchema }),
    async (ctx) => {
      const userService = await ctx.container.resolve('UserService');
      const status = await userService.getProfileStatus(ctx.state.user.sub);

      ctx.status = 200;
      ctx.body = {
        status: status,
      };
    },
  )
  .post(
    'Finish Profile',
    '/setup',
    validate({ body: finishProfileRequestSchema }),
    async (ctx) => {
      const userService = await ctx.container.resolve('UserService');
      await userService
        .finishProfileSetup(ctx.state.user.sub, ctx.validated.body)
        .catch(
          catchType(ProfileAlreadyCompleteException, (e) => {
            ctx.throw(400, { type: e.name, message: e.message });
          }),
        );

      ctx.status = 200;
    },
  );

export default selfRouter as AppRouter;
