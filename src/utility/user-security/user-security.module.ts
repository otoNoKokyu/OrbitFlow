import { Module, Scope } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { ServiceException } from 'src/helper/CustomError';
import { ERR_TYPE } from 'src/interface/CustomError';
import Redis from 'ioredis';
import { RedisPolicy } from '../redis/redis.type';
import { UserSecurityService } from './user-security.service';
import { MailService } from '../mail/mail.service';

@Module({
    imports: [],
    providers: [UserSecurityService, MailService,
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
    exports:[UserSecurityService]
})
export class UserSecurityModule {}
