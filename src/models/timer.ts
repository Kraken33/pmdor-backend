import mongoose, { HydratedDocument, Model } from 'mongoose';

const counterDuration = {
    POMADORO: 25,
    SHORT_BREAK: 5,
    LONG_BREAK: 15,
    TEST: .5,
    SB_TEST: .25,
}

const getDurationByType = (type: TimerTypes) => ({
    [TimerTypes.pomadoro]: counterDuration.POMADORO,
    [TimerTypes.shortBreak]: counterDuration.SHORT_BREAK,
    [TimerTypes.longBreak]: counterDuration.LONG_BREAK,
    [TimerTypes.pomadoroTest]: counterDuration.TEST,
    [TimerTypes.shortBreakTest]: counterDuration.SB_TEST,
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
    pomadoroTest,
    shortBreakTest,
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

interface TimerMethods extends TimerType, Document {
    pause(): Promise<HydratedDocument<TimerType>>;
    play(): Promise<HydratedDocument<TimerType>>;
}

interface TimerModel extends Model<TimerMethods> {
    getCurrent(): Promise<HydratedDocument<TimerMethods>>;
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
    }
}, {
    statics: {
        async getCurrent() {
            return this.findOne().where('status').ne(TimerStatuses.finished).sort('-createdAt');
        },
    },
    methods: {
        async pause() {
            let delta = Date.now() - this.changedAt,
                passed = this.passed + delta;

            this.status = TimerStatuses.paused;
            this.changedAt = Date.now();
            this.passed = passed;
            this.save();

            return this;
        },
        async play() {
            this.status = TimerStatuses.processing;
            this.changedAt = Date.now();
            this.save();

            return this;
        }
    } as any
});

export const Timer = mongoose.model<TimerMethods, TimerModel>('Timer', timerSchema as any);