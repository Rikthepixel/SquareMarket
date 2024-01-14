import Router from '@koa/router';
import { AppContext } from '..';

export default function makeAppRouter<
  TContext extends object = object,
  TState extends object = object,
>(opts: Router.RouterOptions = {}) {
  return new Router<object & TState, AppContext & TContext>(opts);
}

export type AppRouter<
  TContext extends object = object,
  TState extends object = object,
> = Router<object & TState, AppContext & TContext>;
