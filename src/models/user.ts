import mongoose from 'mongoose';

type UserTimer = {
    timerId: string;
    closedAt: number;
}

type User = {
    _id: string;
    timers: Array<UserTimer>;
}

const userTimerSchema = new mongoose.Schema<UserTimer>({
    timerId: String,
    closedAt: Number,
});

const userSchema = new mongoose.Schema<User>({
    timers: {
        type: [userTimerSchema],
        default: []
    },
});

export const User = mongoose.model<User>('User', userSchema);