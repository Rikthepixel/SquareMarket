import makeRouter from '../../helpers/router';
import healthRouter from './health';

const v1Router = makeRouter();

v1Router.use(healthRouter.prefix('/health').routes());

export default v1Router;
