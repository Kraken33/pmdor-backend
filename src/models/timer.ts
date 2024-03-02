import mongoose, { HydratedDocument, Model } from 'mongoose';

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

export enum TimerStatuses {
    paused,
    processing,
    created,
    finished,
}

export enum TimerTypes {
    pomadoro,
    shortBreak,
    longBreak,
    test,
}

export type TimerType = {
    _id: string;
    type: TimerTypes;
    status: TimerStatuses;
    createdAt: number;
    changedAt: number;
    passed: number;
    timerId: number;
}

interface TimerMethods {
    pause(): Promise<HydratedDocument<TimerType> | null>
}

interface TimerModel extends Model<TimerType, {}, TimerMethods> {
    getCurrent(): Promise<HydratedDocument<TimerType>>;
}

const timerSchema = new mongoose.Schema<TimerType, TimerModel, TimerMethods>({
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
            return this.findOne().where('status').ne(TimerStatuses.finished).sort('-createdAt');
        },
    },
});

export const Timer = mongoose.model<TimerType, TimerModel>('Timer', timerSchema);