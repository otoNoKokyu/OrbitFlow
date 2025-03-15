
import { Request, Response, NextFunction } from 'express';
import { JwtService } from 'src/utility/jwt/jwt.service';
import { JwtEncodables } from 'src/utility/utility.type';

export async function verifyMiddleware(req: Request & { user: any }, next: NextFunction) {
    const inviteeCredentials = req.headers['id']
    if (inviteeCredentials) {
        const jwtService = new JwtService()
        const verfiedCred = jwtService.verify(inviteeCredentials as string,JwtEncodables.INVITE)
        if(verfiedCred && Object.keys(verfiedCred)?.length) {
            const {projectId,roleId, inviterId} = verfiedCred 
            req.body = {...req.body,projectId,roleId, invited_by:inviterId}
        }
        return next()
    }
    return next()
};