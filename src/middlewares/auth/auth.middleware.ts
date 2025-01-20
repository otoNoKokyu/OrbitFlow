import { ConflictException, Inject, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MiddlewareException } from 'src/helper/CustomError';
import { RoleService } from 'src/modules/role/role.service';
import { UserService } from 'src/modules/user/user.service';
import { JwtService } from 'src/utility/jwt/jwt.service';
import { JwtEncodables } from 'src/utility/utility.type';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private jwtService: JwtService,
        private middlewareException: MiddlewareException,
        private roleService: RoleService,
    ) {}

    async use(req: Request & { user: any }, res: Response, next: NextFunction) {
        const authToken = req.headers['authorization']?.split(' ')[1];
        if (!authToken) this.middlewareException.throw(401,'Access denied: Token not found')
        try {
            const data = this.jwtService.verify(authToken, JwtEncodables.ACCESS_TOKEN);
            /**
             * this is bad practice..later verfied data will include not id but some detials
             */
            if (data) {
                const userRole = await this.roleService.findOne({role_id: data?.role})
                delete data.role
                req.user = {role: userRole?.role, roleId: userRole?.role_id, ...data };
                return next();
            }

        } catch (e) {
            this.middlewareException.throw(401,e.message)
        }
    }
}
