import makeRouter from "../../helpers/router";
import validate from "../../middleware/validate";
import { healthResponseSchema } from "../../responses/health/HealthResponse";

const healthRouter = makeRouter();

healthRouter.get(
  'Health',
  '/',
  validate({
    response: healthResponseSchema,
  }),
  async (ctx) => {
    ctx.status = 200;
    ctx.body = {
      online: true,
      status: 'available',
    };
  },
);

export default healthRouter;
