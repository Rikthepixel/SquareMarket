import healthRouter from './health';
import makeRouter from '../../helpers/router';

const v1Router = makeRouter();

v1Router.use(healthRouter.prefix('/health').routes());

export default v1Router;
