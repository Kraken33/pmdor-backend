import mongoose from 'mongoose';

export type Task = {
    externalId: string;
    changedAt: number;
}

type Tasks = {
    _id: string;
    ownerId: string;
    list: Task[];
}

const taskSchema = new mongoose.Schema<Task>({
    externalId: String,
    changedAt: {
        type: Number,
        default: Date.now
    },
});

const tasksSchema = new mongoose.Schema<Tasks>({
    ownerId: String,
    list: {
        type: [taskSchema],
        default: []
    },
});

export const Tasks = mongoose.model<Tasks>('Tasks', tasksSchema);