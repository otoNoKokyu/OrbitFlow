import { Module, Scope } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MailService } from 'src/utility/mail/mail.service';
import { IssueRepository } from '../issues/issue.repository';
import { RedisService } from 'src/utility/redis/redis.service';
import Redis from 'ioredis';
import { ServiceException } from 'src/helper/CustomError';
import { ERR_TYPE } from 'src/interface/CustomError';
import { RedisPolicy } from 'src/utility/redis/redis.type';
import { IssuesModule } from '../issues/issues.module';
import { UserRepository } from '../user/user.repository';

@Module({
  providers: [ MailService, NotificationService,IssueRepository,UserRepository ]
})
export class NotificationModule {}
