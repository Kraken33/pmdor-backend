import { Request, Response } from 'express';
import map from 'lodash/fp/map';
import prop from 'lodash/fp/property';
import { User } from '../../models/user';
import { Timer } from '../../models/timer';

const get = async (req: Request, res: Response) => {
    const user = await User.findById(req.user.id);
    const getTimerIds = map(prop('timerId'));

    const timers = user && user.timers.length > 0 ? (await Timer.find({ _id: { $in: getTimerIds(user.timers) } }).sort('-changedAt')) : [];
    const currentTimer = await Timer.getCurrent();

    console.log(user?.timers.length, "g");

    res.send({
        id: user?._id,
        timers: (currentTimer ? [currentTimer] : [] as any).concat(timers)
    });
}

export const userControllers = {
    get,
}