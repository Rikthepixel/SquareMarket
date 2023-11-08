import zodRouter from "koa-zod-router";
import { z } from "zod";

const healthRouter = zodRouter();

healthRouter.register({
  path: "/",
  method: "get",
  handler(ctx) {
    ctx.body = {
      online: true,
      status: "available"
    }
  },
  validate: {
    response: z.object({
      online: z.boolean(),
      status: z.string()
    })
  }
});

export default healthRouter;
