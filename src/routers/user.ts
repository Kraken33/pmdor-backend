import {Router} from 'express';
import {userControllers} from '../controllers/user/user';

const router = Router();

const routerPaths = {
    GET: '/',
}

router.get(routerPaths.GET, userControllers.get);

export const userRouter = router;