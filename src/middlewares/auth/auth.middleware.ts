
import { UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken'
import { JwtService } from 'src/utility/jwt/jwt.service';
import { JwtEncodables } from 'src/utility/utility.type';

export async function authMiddleware(req: Request & { user: any }, res: Response, next: NextFunction) {

    const authToken = req.headers['authorization']?.split(' ')[1]
    if (!authToken) throw new UnauthorizedException({
        statusCode: 401,
        message: 'Access denied: Token not found',
        data: null,
        cached: false,
        timestamp: new Date().toISOString(),
      });
    const jwtService = new JwtService()
    try {
        const data = jwtService.verify(authToken, JwtEncodables.ACCESS_TOKEN)
        if (data) {
            req.user = data
            next()
        }
    } catch (e) {
        throw  new UnauthorizedException({
            statusCode: 401,
            message: e.message,
            data: null,
            cached: false,
            timestamp: new Date().toISOString(),
          });

    }
};