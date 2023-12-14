import makeRouter from '../../helpers/router';
import healthRouter from './health';
import manageRouter from './manage';

const v1Router = makeRouter();

v1Router.use(healthRouter.prefix('/health').routes());
v1Router.use(manageRouter.prefix('/manage').routes());

export default v1Router;
