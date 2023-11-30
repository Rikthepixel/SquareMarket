import KoaRouter from "@koa/router";
import v1Router from "./v1";
import { AppContext } from "..";

const router = new KoaRouter<object, AppContext>();

router.use(v1Router.prefix("/v1").routes());

export default router;
