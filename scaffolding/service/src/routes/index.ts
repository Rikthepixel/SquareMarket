import zodRouter from "koa-zod-router";
import v1Router from "./v1";

const router = zodRouter();

router.use(v1Router.prefix("/v1").routes());

export default router;
