
import { UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken'

export async function authMiddleware(req: Request & { user: any }, res: Response, next: NextFunction) {

    const authToken = req.headers['authorization']?.split(' ')[1]
    if (!authToken) throw new UnauthorizedException('access denied.token not found');
    try {
        const data = jwt.verify(authToken, process.env.JWT_SECRET)
        if (data) {
            req.user = data
            next()
        }
    } catch (e) {
        console.log(e)
        throw new UnauthorizedException('access denied')

    }
};