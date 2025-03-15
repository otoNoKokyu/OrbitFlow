import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, NextFunction } from 'express';
import { RoleService } from 'src/modules/role/role.service';
import { JwtService } from 'src/utility/jwt/jwt.service';
import { JwtEncodables } from 'src/utility/utility.type';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private jwtService: JwtService,
        private roleService: RoleService,
    ) {}

    async use(req: Request & {user:any}, next: NextFunction) {
        const authToken = req.headers['authorization']?.split(' ')[1];
        if (!authToken) throw  new UnauthorizedException('Access denied: Token not found')
        try {
            const data = this.jwtService.verify(authToken, JwtEncodables.ACCESS_TOKEN);
            /**
             * this is bad practice..later verfied data will include not id but some detials
             */
            if (data) {
                const userRole = await this.roleService.findOne({role_id: data?.role})
                delete data.role
                req.user = {role: userRole?.role, ...data };
                return next();
            }

        } catch (e) {
            throw new UnauthorizedException(e.message)
        }
    }
}
