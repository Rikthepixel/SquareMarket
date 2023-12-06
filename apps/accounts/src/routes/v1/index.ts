import makeAppRouter from '../../helpers/router';
import healthRouter from './health';
import selfRouter from './self';

const v1Router = makeAppRouter();

v1Router.use(selfRouter.prefix("/self").routes());
v1Router.use(healthRouter.prefix("/health").routes());

export default v1Router;
