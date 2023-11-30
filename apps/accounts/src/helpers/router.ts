import Router from "@koa/router";
import { AppContext } from "..";

export default function makeRouter<TContext extends object = object, TState extends object = object>(opts: Router.RouterOptions = {}) {
  return new Router<object & TState, AppContext & TContext>(opts)
}
