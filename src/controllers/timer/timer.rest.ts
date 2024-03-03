import { Timer } from '../../models/timer';
import { timer } from './timer.shared';
import { Request, Response } from 'express';

const play = ({socket}: any)=>async (req: Request, res: Response) => {
    if(await timer.play({socket})())
        return res.sendStatus(200);

    return res.sendStatus(404);
}

const pause = async (req: Request, res: Response) => {
    const currentTimer = await Timer.getCurrent();
    if(currentTimer){
        clearTimeout(currentTimer.timerId);
        const nextTimer = await timer.pause();
        req.socket.emit('timer:status_changed', nextTimer);
        return res.sendStatus(200);
    }

    return res.sendStatus(404);
}

const create = async (req: Request, res: Response) => {
    const { type } = req.body;
    const timer = await Timer.create({ type });
    req.socket.emit('timer:status_changed', timer);
    res.send(timer);
}

const current = async (req: Request, res: Response) => {
    res.send(await Timer.getCurrent());
}

export const timerControllers = {
    play,
    pause,
    create,
    current,
}

