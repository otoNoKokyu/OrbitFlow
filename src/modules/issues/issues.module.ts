import { Module, Scope } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { IssuesController } from './issues.controller';
import { IssueStatusRepository } from './issueStatus.repository';
import { IssueRepository } from './issue.repository';
import { NotificationModule } from '../notification/notification.module';
import { NotificationService } from '../notification/notification.service';
import { MailService } from 'src/utility/mail/mail.service';
import { ProjectModule } from '../project/project.module';
import { ProjectRepository } from '../project/project.repository';
import { RedisService } from 'src/utility/redis/redis.service';
import { RedisPolicy } from 'src/utility/redis/redis.type';
import { ServiceException } from 'src/helper/CustomError';
import { ERR_TYPE } from 'src/interface/CustomError';
import Redis from 'ioredis';

@Module({
  imports:[NotificationModule,ProjectModule],
  providers: [IssuesService,IssueStatusRepository,IssueRepository,NotificationService,MailService,ProjectRepository,
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
  controllers: [IssuesController]
})
export class IssuesModule {}
