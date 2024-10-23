import { Timer, TimerStatuses, TimerTypes } from '../../models/timers';
import { User } from '../../models/user';
import { getDurationByType, timeouts } from './shared';
import { Request, Response } from 'express';

const play = ({ socket }: any) => async (req: Request, res: Response) => {
    const { recreate, type } = req.body;
    const { id } = req.user;
    const currentTimer = await Timer.getCurrent();
    if (currentTimer) {
        const nextTimer = await currentTimer.play();
        let duration = getDurationByType(type);
        if (nextTimer.passed > 0)
            duration -= nextTimer.passed;
        timeouts.create(nextTimer._id, async () => {
            const closedAt = Date.now();
            const currentTimer = await Timer.findByIdAndUpdate(nextTimer._id, { status: TimerStatuses.finished, passed: duration, changedAt: closedAt }, { new: true });
            socket.emit('timer:status_changed', currentTimer);
            // debugger;
            await User.findByIdAndUpdate(id, { $push: { timers: { timerId: currentTimer?._id, closedAt } } });

            if (currentTimer && recreate) {
                const createNextTimer = async (type: TimerTypes.pomadoro | TimerTypes.shortBreak) => Timer.create({
                    type: {
                        [TimerTypes.pomadoro]: () => TimerTypes.shortBreak,
                        [TimerTypes.shortBreak]: () => TimerTypes.pomadoro,
                    }[type]()
                });

                const nextTimer = await createNextTimer(currentTimer.type as TimerTypes.pomadoro | TimerTypes.shortBreak);
                socket.emit('timer:status_changed', nextTimer);
            }
        }, duration);
        return res.sendStatus(200);
    }

    return res.sendStatus(404);
}

const pause = async (req: Request, res: Response) => {
    const currentTimer = await Timer.getCurrent();
    if (currentTimer) {
        clearTimeout(currentTimer.timerId);
        const nextTimer = await currentTimer.pause();
        req.socket.emit('timer:status_changed', nextTimer);
        return res.sendStatus(200);
    }

    return res.sendStatus(404);
}

const create = async (req: Request, res: Response) => {
    const { type } = req.body;
    const timer = await Timer.create({ type });
    req.socket.emit('timer:status_changed', timer);
    res.send(timer);
}

const current = async (req: Request, res: Response) => {
    res.send(await Timer.getCurrent());
}

export const timersControllers = {
    play,
    pause,
    create,
    current,
}

