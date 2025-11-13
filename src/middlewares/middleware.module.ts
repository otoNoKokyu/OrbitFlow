import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { AuthMiddleware } from './auth/auth.middleware';
import { JwtService } from 'src/utility/jwt/jwt.service';
import { RoleService } from 'src/modules/role/role.service';
import { RoleModule } from 'src/modules/role/role.module';

@Module({
    providers: [
        JwtService
    ],
    imports:[RoleModule]
})
export class MiddlewareModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .exclude(
                { path: '/auth/signin', method: RequestMethod.POST },
                { path: '/auth/signup', method: RequestMethod.POST },
                { path: '/auth/token', method: RequestMethod.POST },
                { path: '/role/create', method: RequestMethod.POST },
                { path: '/auth/verify', method: RequestMethod.POST },
                { path: '/auth/sendOtp', method: RequestMethod.POST },
                { path: '/auth/getInvitedEmail', method: RequestMethod.GET },
                { path: '/auth/forget-password', method: RequestMethod.POST },
                { path: '/auth/forgotPassword', method: RequestMethod.GET },
                { path: '/auth/reset-password', method: RequestMethod.POST
                 },
              )
              .forRoutes({path: '*', method: RequestMethod.ALL})
    }
}