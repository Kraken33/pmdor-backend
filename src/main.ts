import { Express } from 'express';
import { Server } from 'socket.io';
import { Timer } from './models/timer';
import { timerWSControllers } from './controllers/timer/timer.ws';
import { createExpress } from './app/createExpress';
import { createMongodbConnection } from './app/createMongodbConnection';
import { createWSConnection } from './app/createWSConnection';
import { timerRouter } from './routers/timer';
import { userRouter } from './routers/user';
import { User } from './models/user';

function bootstrap<T = any>(onDone: (p: { app: Express; io: Server }) => void) {
    createMongodbConnection();
    const { app, server } = createExpress();
    const io = createWSConnection({ server });
    onDone({ app, io });
}

let currentSocket: any = null;

bootstrap(async ({ app, io }) => {
    let user: any = await User.findOne();
    console.log(user, 'u');
    if (user === null)
        user = await User.create({});
    app.use((req, res, next) => {
        req.user = {
            id: user._id,
        };
        next();
    });
    timerRouter.use((req, res, next) => {
        req.socket = currentSocket;
        next();
    });
    app.use('/timer', timerRouter);
    app.use('/user', userRouter);

    io.on('connection', async (socket: any) => {
        currentSocket = socket;
        socket.join(user._id);
        socket.on('timer:play', timerWSControllers.play({ socket: io, userId: user._id }));
        socket.on('timer:pause', timerWSControllers.pause({ socket }));
    })
});