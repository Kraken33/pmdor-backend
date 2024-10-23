import { Request, Response } from 'express';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
import reduce from 'lodash/fp/reduce';
import prop from 'lodash/fp/property';
import { User, UserTimer } from '../../models/user';
import { Timer } from '../../models/timers';
import { getCurrentTimestamp } from '../../utils/date';

const get = async (req: Request, res: Response) => {
    const user = await User.findById(req.user.id);
    const getTodaysTimers = flow(
        reduce((acc: { timers: Array<string>; targetTime: number }, item: UserTimer) => {
            if (item.closedAt > acc.targetTime)
                acc.timers.push(item.timerId);

            return acc;
        }, { targetTime: getCurrentTimestamp(), timers: [] }),
        prop('timers')
    );

    const timers = user && user.timers.length > 0
        ? (await Timer.find({ _id: { $in: getTodaysTimers(user.timers) } }).sort('changedAt')) : [];
    const currentTimer = await Timer.getCurrent();

    res.send({
        id: user?._id,
        timers: (currentTimer ? [currentTimer] : [] as any).concat(timers)
    });
}

export const userControllers = {
    get,
}