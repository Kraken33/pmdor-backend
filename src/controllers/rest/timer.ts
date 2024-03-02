import { timer } from '../timer';
import { Request, Response } from 'express';

const play = ({socket}: any)=>async (req: Request, res: Response) => {
    if(await timer.play({socket})())
        return res.sendStatus(200);

    return res.sendStatus(404);
}

export const timerControllers = {
    play,
}

