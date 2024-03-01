import http from 'http';
import express from 'express';
import socketIO from 'socket.io';
import mongoose, { HydratedDocument, Model } from 'mongoose';
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

export enum TimerStatuses {
    paused,
    processing,
    created,
    finished,
}

enum TimerTypes {
    pomadoro,
    shortBreak,
    longBreak,
}

type TimerType = {
    _id: string;
    type: TimerTypes;
    status: TimerStatuses;
    createdAt: number;
    changedAt: number;
    passed: number;
    timerId: number;
}

interface TimerModel extends Model<TimerType> {
    getCurrent(): Promise<HydratedDocument<TimerType>>;
}

const timerSchema = new mongoose.Schema<TimerType, TimerModel>({
    // _id: mongoose.SchemaTypes.UUID,
    type: {
        type: Number,
        enum: TimerTypes,
        default: TimerTypes.pomadoro,
    },
    status: {
        type: Number,
        enum: TimerStatuses,
        default: TimerStatuses.created,
    },
    createdAt: {
        type: Number,
        default: () => Date.now(),
    },
    changedAt: {
        type: Number,
        default: () => Date.now(),
    },
    passed: {
        type: Number,
        default: 0,
    },
    timerId: {
        type: Number,
        default: 0,
    }
}, {
    statics: {
        async getCurrent() {
            return await this.findOne().where('status').ne(TimerStatuses.finished).sort('-createdAt');
        },
    }
});

const Timer = mongoose.model<TimerType, TimerModel>('Timer', timerSchema);

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/pmdor');
}

app.get('/timer/create', async (req, res) => {
    const { type } = req.query;
    const timer = await Timer.create({ type });
    res.send(timer);
    io.emit('statusChanged', timer);
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
        io.emit('statusChanged', nextTimer);
    } else {
        res.sendStatus(404);
    }
})

app.get('/timer/:id/play', async (req, res) => {
    const { id } = req.params;
    let timer: HydratedDocument<TimerType> | null = null;
    try {
        timer = await Timer.findById(id);
    } catch (e) {
        res.sendStatus(500);
    }

    if (timer) {
        let duration = timer.type === TimerTypes.pomadoro ? 25 * 60_000 : 5 * 60_000;
        if (timer.passed > 0)
            duration -= timer.passed;

        const timerId = setTimeout(async () => {
            const finishedTimer = await Timer.findByIdAndUpdate({ _id: id }, { status: TimerStatuses.finished, passed: duration, changedAt: Date.now() }).exec();
            io.emit('statusChanged', finishedTimer);
        }, duration);

        await Timer.updateOne({ _id: id }, { status: TimerStatuses.processing, changedAt: Date.now(), timerId: Number(timerId) }).exec();
        const nextTimer = await Timer.findById(id);
        res.sendStatus(200);
        io.emit('statusChanged', nextTimer);
    } else {
        res.sendStatus(404);
    }
})

server.listen(port, () => {
    console.log(`Listening on port ${port}`)
})