import 'dotenv/config';

import { Express } from 'express';
import { Server } from 'socket.io';
import { Timer } from './models/timers';
import { timerWSControllers } from './controllers/timers/timer.ws';
import { createExpress } from './app/createExpress';
import { createMongodbConnection } from './app/createMongodbConnection';
import { createWSConnection } from './app/createWSConnection';
import { timersRouter } from './routers/timers';
import { userRouter } from './routers/user';
import { tasksRouter } from './routers/tasks';
import { User } from './models/user';
// import { tasksController } from './controllers/tasks';
import { Tasks } from './models/task';

function bootstrap<T = any>(onDone: (p: { app: Express; io: Server }) => void) {
    createMongodbConnection().then(()=>{
        const { app, server } = createExpress();
        const io = createWSConnection({ server });
        onDone({ app, io });
    });
}

let currentSocket: any = null;

bootstrap(async ({ app, io }) => {
    let user: any = await User.findOne();
    if (user === null) {
        user = await User.create({});
        await Tasks.create({ownerId: user._id});
    }
    app.use((req, res, next) => {
        req.user = {
            id: user._id,
        };
        next();
    });
    timersRouter.use((req: any, res: any, next: any) => {
        req.socket = currentSocket;
        next();
    });
    app.use('/timer', timersRouter);
    app.use('/user', userRouter);
    app.use('/tasks', tasksRouter);

    io.on('connection', async (socket: any) => {
        currentSocket = socket;
        socket.join(user._id);
        socket.on('timer:play', timerWSControllers.play({ socket: io, userId: user._id }));
        socket.on('timer:pause', timerWSControllers.pause({ socket }));
    })
});