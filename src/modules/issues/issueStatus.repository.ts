import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository.base';
import { IssueStatus } from './model/issue_status.model';

@Injectable()
export class IssueStatusRepository extends BaseRepository<IssueStatus> {
  constructor() {
    super(IssueStatus)
  }
  async createDefaultProjectStatus (projectId:string) {
    const defaultStatus = [{
      status: 'To Do',
      projectId,
      level: 0
    },
    {
      status: 'In Progress',
      projectId,
      level: 1

    },
    {
      status: 'On Review',
      projectId,
      level: 2
    },]
    return await this.model.bulkCreate(defaultStatus);

  }
}
