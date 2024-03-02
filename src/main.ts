import http from 'http';
import express from 'express';
import socketIO from 'socket.io';
import mongoose, { HydratedDocument } from 'mongoose';
import { Timer, TimerType, TimerStatuses } from './models/timer';
import { timerControllers } from './controllers/rest/timer';
import { timerWSControllers } from './controllers/ws/timer';
import cors from 'cors';
const app = express();
const port = 3000;

app.use(cors());

const server = http.createServer(app);
const io = new socketIO.Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});


main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/pmdor');
}

let currentSocket: any = null;

const pauseTimer = async () => {
    const timer: HydratedDocument<TimerType> | null = await Timer.getCurrent();

    if (timer) {
        let delta = Date.now() - timer.changedAt;
        const passed = timer.passed + delta;

        clearTimeout(timer.timerId);

        return Timer.findByIdAndUpdate({ _id: timer._id }, { status: TimerStatuses.paused, changedAt: Date.now(), timerId: 0, passed }, { new: true });
    } else {
        return null;
    }
}

io.on('connection', async (socket) => {
    currentSocket = socket;
    socket.emit('timer:get_current', await Timer.getCurrent());
    socket.on('timer:play', timerWSControllers.play({ socket }));

    socket.on('timer:pause', async () => {
        const timer = await pauseTimer();
        if (timer)
            currentSocket.emit('timer:status_changed', timer);
    });
})

app.get('/timer/create', async (req, res) => {
    const { type } = req.query;
    const timer = await Timer.create({ type });
    res.send(timer);
    io.emit('timer:status_changed', timer);
})

app.get('/timer/current', async (req, res) => {
    res.send(await Timer.getCurrent());
})

app.get('/timer/:id', async (req, res) => {
    const { id } = req.params;
    res.send(await Timer.findById(id));
})

app.get('/timer/:id/pause', async (req, res) => {
    const { id } = req.params;
    const timer: HydratedDocument<TimerType> | null = await Timer.findById(id);

    if (timer) {
        let delta = Date.now() - timer.changedAt;
        const passed = timer.passed + delta;

        clearTimeout(timer.timerId);

        await Timer.updateOne({ _id: id }, { status: TimerStatuses.paused, changedAt: Date.now(), timerId: 0, passed });
        const nextTimer = await Timer.findById(id);
        res.sendStatus(200);
        io.emit('timer:status_changed', nextTimer);
    } else {
        res.sendStatus(404);
    }
})

app.get('/timer/:id/play', timerControllers.play({ socket: currentSocket }))

server.listen(port, () => {
    console.log(`Listening on port ${port}`)
})