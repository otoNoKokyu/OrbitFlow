import { Module } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { IssuesController } from './issues.controller';
import { IssueStatusRepository } from './issueStatus.repository';
import { IssueRepository } from './issue.repository';

@Module({
  providers: [IssuesService,IssueStatusRepository,IssueRepository],
  controllers: [IssuesController]
})
export class IssuesModule {}
