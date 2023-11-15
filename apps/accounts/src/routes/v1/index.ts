import KoaRouter from "@koa/router";
import healthRouter from "./health";

const v1Router = new KoaRouter();

v1Router.use(healthRouter.prefix("/health").routes());

export default v1Router;
