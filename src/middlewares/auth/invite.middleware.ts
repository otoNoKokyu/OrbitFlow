
import { Request, Response, NextFunction } from 'express';
import { JwtService } from 'src/utility/jwt/jwt.service';
import { JwtEncodables } from 'src/utility/utility.type';

export async function verifyMiddleware(req: Request & { user: any },res, next: NextFunction) {
    const inviteeCredentials = req.headers['id']
    if (inviteeCredentials) {
        const jwtService = new JwtService()
        const verfiedCred = jwtService.verify(inviteeCredentials as string,JwtEncodables.INVITE)
        if(verfiedCred && Object.keys(verfiedCred)?.length) {
            const {projectId,roleId, invited_by,email} = verfiedCred 
            req.body = {...req.body,projectId,roleId, invited_by,email}
        }
        return next()
    }
    return next()
};