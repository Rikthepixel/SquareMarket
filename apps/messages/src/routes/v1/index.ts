import makeRouter from '../../helpers/router';
import wsChatsRouter from './chats';
import healthRouter from './health';

const v1Router = makeRouter();

v1Router.use(healthRouter.prefix('/health').routes());
v1Router.use(wsChatsRouter.prefix('/chats').routes());

export default v1Router;
