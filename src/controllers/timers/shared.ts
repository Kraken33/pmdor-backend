import { TimerTypes } from '../../models/timers';
import { counterDuration } from '../../consts/timer';

export const getDurationByType = (type: TimerTypes) => ({
    [TimerTypes.pomadoro]: counterDuration.POMADORO,
    [TimerTypes.shortBreak]: counterDuration.SHORT_BREAK,
    [TimerTypes.longBreak]: counterDuration.LONG_BREAK,
    [TimerTypes.pomadoroTest]: counterDuration.TEST,
    [TimerTypes.shortBreakTest]: counterDuration.SB_TEST,
}[type] * 60_000)

export function createTimerTimouts() {
    const timeouts: Record<string, NodeJS.Timeout> = {};

    return {
        create(docId: string, cb: ()=>void, ms: number) {
            timeouts[docId] = setTimeout(cb, ms);
        },
        close(docId:string) {
            return clearTimeout(timeouts[docId]);
        }
    }
}

export const timeouts = createTimerTimouts();