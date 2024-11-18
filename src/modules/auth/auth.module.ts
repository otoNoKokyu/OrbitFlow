import { Module, Scope } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/modules/user/user.module';
import { RoleModule } from 'src/modules/role/role.module';
import { ProjectModule } from 'src/modules/project/project.module';
import { MailService } from 'src/utility/mail/mail.service';
import { RedisService } from 'src/utility/redis/redis.service';
import { RedisPolicy } from 'src/utility/redis/redis.type';
import Redis from 'ioredis';
@Module({
  imports : [UserModule,RoleModule,ProjectModule],
  providers: [AuthService,MailService,
    {
      provide: 'USER_POLICY',  
      useValue: RedisPolicy.USER,  
    },
    {
      provide: RedisService,
      useFactory: (policy: RedisPolicy) => new RedisService(new Redis(), policy),
      inject: ['USER_POLICY'],
      scope: Scope.REQUEST, 
    },
  ],
  controllers: [AuthController]
})
export class AuthModule {}
