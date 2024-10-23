import {Router} from 'express';
import {timersControllers} from '../controllers/timers/timer.rest';

const router = Router();

const routerPaths = {
    CURRENT: '/current',
    CREATE: '/create',
    PAUSE: '/:id/pause',
    PLAY: '/:id/play'
}

router.get(routerPaths.CURRENT, timersControllers.current);
router.post(routerPaths.CREATE, timersControllers.create);
router.put(routerPaths.PAUSE, timersControllers.pause);
router.put(routerPaths.PLAY, timersControllers.play);

export const timersRouter = router;