import { Module } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { IssuesController } from './issues.controller';

@Module({
  providers: [IssuesService],
  controllers: [IssuesController]
})
export class IssuesModule {}
