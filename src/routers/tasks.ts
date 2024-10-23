import { Router } from 'express';
import { tasksController } from '../controllers/tasks';

const router = Router();

const routerPaths = {
    GET_LIST: '/list',
}

router.get(routerPaths.GET_LIST, tasksController.getList);

export const tasksRouter = router;