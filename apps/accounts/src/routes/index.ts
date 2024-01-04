import v1Router from './v1';
import makeAppRouter from '../helpers/router';

const router = makeAppRouter();

router.use(v1Router.prefix('/v1').routes());

export default router;
