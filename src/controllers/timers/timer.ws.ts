import { HydratedDocument } from 'mongoose';
import { TimerTypes, TimerType, Timer, TimerStatuses } from '../../models/timers';
import { getDurationByType, timeouts } from './shared';
import { User } from '../../models/user';

const play = ({ socket, userId }: any) => async ({ type, recreate }: { type: TimerTypes, recreate: boolean } = { type: TimerTypes.pomadoro, recreate: false }) => {
    let currentTimer = await Timer.findOne().where('status').ne(TimerStatuses.finished).sort('-createdAt') || await Timer.create({ type });

    const nextTimer = await currentTimer.play();
    let duration = getDurationByType(type);
    if (nextTimer.passed > 0)
        duration -= nextTimer.passed;

    socket.to(userId).emit('timer:status_changed', nextTimer);
    timeouts.create(nextTimer._id, async () => {
        // debugger;
        // debugger;
        const closedAt = Date.now();
        const currentTimer = await Timer.findByIdAndUpdate(nextTimer._id, { status: TimerStatuses.finished, passed: duration, changedAt: closedAt }, { new: true });
        socket.to(userId).emit('timer:status_changed', currentTimer);
        // debugger;
        await User.findByIdAndUpdate(userId, { $push: { timers: { timerId: currentTimer?._id, closedAt } } });

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
}

const pause = ({ socket }: any) => async () => {
    let currentTimer = await Timer.getCurrent();

    if (currentTimer) {
        timeouts.close(currentTimer._id);
        const nextTimer = await currentTimer.pause();
        socket.emit('timer:status_changed', nextTimer);
    }
}

export const timerWSControllers = {
    play,
    pause,
}