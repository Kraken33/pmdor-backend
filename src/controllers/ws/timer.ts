import { HydratedDocument } from 'mongoose';
import { TimerTypes, TimerType, Timer } from '../../models/timer';
import { timer } from '../timer';

const play = ({ socket }: any) => async ({ type }: { type: TimerTypes } = { type: TimerTypes.test }) => {
    let currentTimer: HydratedDocument<TimerType> | null = await Timer.getCurrent();
    if (!currentTimer)
        currentTimer = await Timer.create({ type });
    const nextTimer = await timer.play({ socket })();
    if (nextTimer)
        socket.emit('timer:status_changed', nextTimer);
}

export const timerWSControllers = {
    play,
}