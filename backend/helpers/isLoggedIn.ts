import { Request, Response, NextFunction } from 'express';

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    req.user ? next() : res.sendStatus(401);
}
