import { Inject, Injectable } from '@nestjs/common';
import { IssueRepository } from './issue.repository';
import { ServiceException } from 'src/helper/CustomError';
import { ERR_TYPE } from 'src/interface/CustomError';
import { BaseService } from 'src/common/service.base';
import { Issue } from './model/issue.model';
import { AtLeastOneAttribute, EntityAttributes, ModelCreationAttributes } from 'src/common/interface/IBase';
import { InferAttributes } from 'sequelize';
import { number } from 'joi';

@Injectable()
export class IssuesService extends BaseService<Issue> {
  constructor(
    private IssueRepository: IssueRepository,
    @Inject('ServiceException') private serviceException: ServiceException<ERR_TYPE>,

  ) {
    super(IssueRepository)
  }
  async create(data: ModelCreationAttributes<Issue>) {
    const existingIssue = await this.IssueRepository.findOne({ name: data.name, projectId: data.projectId, type: data.type })
    if (existingIssue) throw this.serviceException.throw('RESOURCE_CONFLICT', 'Issue already exists')
    return await this.IssueRepository.create(data)
  }
  async findAll(query: EntityAttributes<Issue>, page = 1, limit = 10) {
    return await this.IssueRepository.findAndCountAll(query, page, limit)
  }
  async update(
    filter: AtLeastOneAttribute<Issue>,
    body: AtLeastOneAttribute<Issue>
  ) {
    if(body.loggedTime || body.estimate){
      const issue = await this.IssueRepository.findOne({id:filter.id},['loggedTime','estimate'])
      const remaining = (body?.estimate ?? (issue.estimate || 0) )- (body?.loggedTime ?? (issue.loggedTime || 0))
      body.remaining = remaining
    }
    const [affectedCount] = await this.IssueRepository.update(filter, body);
    if (affectedCount > 0) return 'update successful'
    else return 'update unsuccessful'
  }
}
