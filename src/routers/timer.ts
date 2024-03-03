import {Router} from 'express';
import {timerControllers} from '../controllers/timer/timer.rest';

const router = Router();

const routerPaths = {
    CURRENT: '/current',
    CREATE: '/create',
    PAUSE: '/:id/pause',
    PLAY: '/:id/play'
}

router.get(routerPaths.CURRENT, timerControllers.current);
router.post(routerPaths.CREATE, timerControllers.create);
router.put(routerPaths.PAUSE, timerControllers.pause);
router.put(routerPaths.PLAY, timerControllers.play);

export const timerRouter = router;