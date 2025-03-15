import { Inject, Injectable } from '@nestjs/common';
import { IssueRepository } from './issue.repository';
import { ServiceException } from 'src/helper/CustomError';
import { ERR_TYPE } from 'src/interface/CustomError';
import { BaseService } from 'src/common/service.base';
import { Issue } from './model/issue.model';
import { ModelCreationAttributes } from 'src/common/interface/IBase';

@Injectable()
export class IssuesService extends BaseService<Issue> {
    constructor(
        private IssueRepository: IssueRepository,
        @Inject('ServiceException') private serviceException: ServiceException<ERR_TYPE>,
      
      ) {
        super(IssueRepository)
      }
    async create(data:ModelCreationAttributes<Issue>){
        const existingIssue = await this.IssueRepository.findOne({name:data.name, projectId: data.projectId})
        if(existingIssue) throw this.serviceException.throw('RESOURCE_CONFLICT','Issue already exists')
        return await this.IssueRepository.create(data)
    }
}
