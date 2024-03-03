import { Timer } from './models/timer';
import { timerWSControllers } from './controllers/timer/timer.ws';
import { createExpress } from './app/createExpress';
import { createMongodbConnection } from './app/createMongodbConnection';
import { createWSConnection } from './app/createWSConnection';
import { timerRouter } from './routers/timer';

function bootstrap(onDone: (p: { app: any; io: any }) => void) {
    createMongodbConnection();
    const { app, server } = createExpress();
    const io = createWSConnection({ server });
    onDone({ app, io });
}

let currentSocket: any = null;

bootstrap(({ app, io }) => {
    timerRouter.use((req, res, next) => {
        req.socket = currentSocket;
        next();
    });
    app.use('/timer', timerRouter);

    io.on('connection', async (socket: any) => {
        currentSocket = socket;
        socket.emit('timer:get_current', await Timer.getCurrent());
        socket.on('timer:play', timerWSControllers.play({ socket }));
        socket.on('timer:pause', timerWSControllers.pause({ socket }));
    })
});