import KoaRouter from "@koa/router";
import v1Router from "./v1";

const router = new KoaRouter();

router.use(v1Router.prefix("/v1").routes());

export default router;
