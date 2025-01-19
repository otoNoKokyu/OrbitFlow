import { MiddlewareConsumer, Module, Scope } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RoleModule } from 'src/modules/role/role.module';
import { ProjectModule } from 'src/modules/project/project.module';
import { MailService } from 'src/utility/mail/mail.service';
import { RedisService } from 'src/utility/redis/redis.service';
import { RedisPolicy } from 'src/utility/redis/redis.type';
import Redis from 'ioredis';
import { JwtService } from 'src/utility/jwt/jwt.service';
import { verifyMiddleware } from 'src/middlewares/auth/invite.middleware';
import { ServiceException } from 'src/helper/CustomError';
import { ERR_TYPE } from 'src/interface/CustomError';
import { UserModule } from '../user/user.module';
import { UserSecurityModule } from 'src/utility/user-security/user-security.module';
@Module({
  imports : [RoleModule,ProjectModule, UserModule, UserSecurityModule],
  providers: [AuthService,MailService, JwtService,
    {
      provide: 'USER_POLICY',  
      useValue: RedisPolicy.USER,  
    },
    {
      provide: 'serviceException',  
      useValue: ServiceException,  
    },
    {
      provide: RedisService,
      useFactory: (policy: RedisPolicy,exceptionClass: ServiceException<ERR_TYPE>) => new RedisService(new Redis(), policy,exceptionClass),
      inject: ['USER_POLICY','serviceException'],
      scope: Scope.REQUEST, 
    },
  ],
  controllers: [AuthController]
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(verifyMiddleware)
      .forRoutes('auth/signup');
  }
}
