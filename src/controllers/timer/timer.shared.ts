import { HydratedDocument } from 'mongoose';
import { TimerType, Timer, TimerTypes, TimerStatuses } from '../../models/timer';
import { User } from '../../models/user';

const counterDuration = {
    POMADORO: 25,
    SHORT_BREAK: 5,
    LONG_BREAK: 15,
    TEST: .5,
}

const getDurationByType = (type: TimerTypes) => ({
    [TimerTypes.pomadoro]: counterDuration.POMADORO,
    [TimerTypes.shortBreak]: counterDuration.SHORT_BREAK,
    [TimerTypes.longBreak]: counterDuration.LONG_BREAK,
    [TimerTypes.test]: counterDuration.TEST
}[type] * 60_000)

const play = ({ socket }: any) => async ({ userId }: { userId: string }) => {
    let timer: HydratedDocument<TimerType> | null = await Timer.getCurrent();

    const createTimeout2FinishTimer = ({ duration, onFinish }: { duration: number, onFinish(): Promise<void> }) => {
        return Number(setTimeout(onFinish, duration));
    }

    if (timer) {
        let duration = getDurationByType(timer.type);
        if (timer.passed > 0)
            duration -= timer.passed;

        const timerId = createTimeout2FinishTimer({
            duration, onFinish: async () => {
                console.log('finished');
                const closedAt = Date.now();
                const nextTimer = await Timer.findByIdAndUpdate({ _id: timer?._id }, { status: TimerStatuses.finished, passed: duration, changedAt: closedAt, timerId: 0 }, { new: true });
                socket.emit('timer:status_changed', nextTimer);
                // debugger;
                await User.findByIdAndUpdate(userId, { $push: { timers: { timerId: nextTimer?._id, closedAt } } });
            }
        });

        return Timer.findByIdAndUpdate({ _id: timer._id }, { status: TimerStatuses.processing, changedAt: Date.now(), timerId }, { new: true });
    } else {
        return null;
    }
}

const pause = async () => {
    const timer: HydratedDocument<TimerType> | null = await Timer.getCurrent();

    if (timer) {
        let delta = Date.now() - timer.changedAt;
        const passed = timer.passed + delta;

        return Timer.findByIdAndUpdate({ _id: timer._id }, { status: TimerStatuses.paused, changedAt: Date.now(), timerId: 0, passed }, { new: true });
    } else {
        return null;
    }
}

export const timer = {
    play,
    pause,
}