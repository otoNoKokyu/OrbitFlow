import { Module, Scope } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { IssuesController } from './issues.controller';
import { IssueStatusRepository } from './issueStatus.repository';
import { IssueRepository } from './issue.repository';
import { NotificationModule } from '../notification/notification.module';
import { NotificationService } from '../notification/notification.service';
import { MailService } from 'src/utility/mail/mail.service';
import { ProjectRepository } from '../project/project.repository';
import { RedisService } from 'src/utility/redis/redis.service';
import { RedisPolicy } from 'src/utility/redis/redis.type';
import { ServiceException } from 'src/helper/CustomError';
import { ERR_TYPE } from 'src/interface/CustomError';
import Redis from 'ioredis';
import { UserRepository } from '../user/user.repository';
import { EventBusModule } from '../shared/event-bus.module';

@Module({
  imports:[EventBusModule],
  providers: [IssuesService,IssueStatusRepository,IssueRepository,MailService,ProjectRepository,UserRepository,
    {
      provide: 'ISSUE_POLICY',  
      useValue: RedisPolicy.ISSUE,  
    },
    {
      provide: 'serviceException',  
      useClass: ServiceException,  
    },
    {
      provide: RedisService,
      useFactory: (policy: RedisPolicy,exceptionClass: ServiceException<ERR_TYPE>) => new RedisService(new Redis(), policy,exceptionClass),
      inject: ['ISSUE_POLICY','serviceException'],
      scope: Scope.REQUEST, 
    },
  ],
  exports:[IssueRepository],
  controllers: [IssuesController]
})
export class IssuesModule {}
