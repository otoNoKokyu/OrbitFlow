import { Module } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { IssuesController } from './issues.controller';
import { IssueStatusRepository } from './issueStatus.repository';
import { IssueRepository } from './issue.repository';
import { NotificationModule } from '../notification/notification.module';
import { NotificationService } from '../notification/notification.service';
import { MailService } from 'src/utility/mail/mail.service';
import { ProjectModule } from '../project/project.module';
import { ProjectRepository } from '../project/project.repository';

@Module({
  imports:[NotificationModule,ProjectModule],
  providers: [IssuesService,IssueStatusRepository,IssueRepository,NotificationService,MailService,ProjectRepository],
  controllers: [IssuesController]
})
export class IssuesModule {}
