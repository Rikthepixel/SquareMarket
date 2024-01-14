import v1Router from './v1';
import makeRouter from '../helpers/router';

const router = makeRouter();

router.use(v1Router.prefix('/v1').routes());

export default router;
