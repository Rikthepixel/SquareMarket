import zodRouter from "koa-zod-router";
import healthRouter from "./health";

const v1Router = zodRouter();

v1Router.use(healthRouter.prefix("/health").routes());

export default v1Router;
