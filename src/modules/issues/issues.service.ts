import { Inject, Injectable } from '@nestjs/common';
import { IssueRepository } from './issue.repository';
import { ServiceException } from 'src/helper/CustomError';
import { ERR_TYPE } from 'src/interface/CustomError';
import { BaseService } from 'src/common/service.base';
import { Issue } from './model/issue.model';
import { AtLeastOneAttribute, EntityAttributes, ModelCreationAttributes } from 'src/common/interface/IBase';
import { NotificationService } from '../notification/notification.service';
import { ProjectRepository } from '../project/project.repository';
import { RedisService } from 'src/utility/redis/redis.service';
import _ from 'lodash'
import { isEmptyObject } from 'src/utility/NullishUtills';
import { UserRepository } from '../user/user.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationType } from '../shared/shared.types';


@Injectable()
export class IssuesService extends BaseService<Issue> {
  constructor(
    private IssueRepository: IssueRepository,
    private projectRepository: ProjectRepository,
    @Inject('serviceException') private serviceException: ServiceException<ERR_TYPE>,
    private readonly redisService: RedisService,
    private readonly userRepo: UserRepository,
    private readonly eventEmmiter: EventEmitter2,

  ) {
    super(IssueRepository)
  }

  private async getIssueProjectId(issue: ModelCreationAttributes<Issue>): Promise<string> {
    if (!issue.projectId) throw this.serviceException.throw('RESOURCE_CONFLICT', 'projectid not found');

    const project = await this.projectRepository.findOne({ id: issue.projectId });
    if (!project) throw this.serviceException.throw('RESOURCE_CONFLICT', 'project not found');;

    let prefix: string;
    const words = project.name.split(' ');
    if (words.length >= 3) {
      prefix = words.slice(0, 3).map(word => word[0].toUpperCase()).join('');
    } else {
      prefix = project.name.substring(0, 3).toUpperCase();
    }

    const count = await Issue.count({ where: { projectId: issue.projectId } });
    return `${prefix}-${count + 1}`;
  }
  async create(data: ModelCreationAttributes<Issue>) {
    const existingIssue = await this.IssueRepository.findOne({ name: data.name, projectId: data.projectId, type: data.type })
    if (existingIssue) throw this.serviceException.throw('RESOURCE_CONFLICT', 'Issue already exists')
    const projectIssueId = await this.getIssueProjectId(data)
    const issue = await this.IssueRepository.create({ ...data, projectIssueId })
    const popultaedIssue = await this.IssueRepository.findIssueForNotification(issue.id)
    if (!isEmptyObject(popultaedIssue)) this.redisService.setTempData(issue.id, popultaedIssue, 7200)
    this.eventEmmiter.emitAsync(NotificationType.ISSUE_CREATE,issue)
    return issue;
  }
  async findAll(query: EntityAttributes<Issue>, page = 1, limit = 10) {
    return await this.IssueRepository.findAndCountAll(query, page, limit)
  }
  async update(
    filter: AtLeastOneAttribute<Issue>,
    body: AtLeastOneAttribute<Issue>,
  ) {
    let storedData = await this.redisService.getTempData(filter.id)
    if (!storedData) storedData = await this.IssueRepository.findIssueForNotification(filter.id)

    if (body.loggedTime || body.estimate) {
      const issue = await this.IssueRepository.findOne({ id: filter.id }, null, ['loggedTime', 'estimate'])
      const remaining = (body?.estimate ?? (issue.estimate || 0)) - (body?.loggedTime ?? (issue?.loggedTime || 0))
      body.remaining = remaining
    }
    const [affectedCount] = await this.IssueRepository.update(filter, body);
    if (affectedCount > 0) {
      this.eventEmmiter.emitAsync(NotificationType.ISSUE_ATTRIBUTES_CHANGE,body,storedData)
      await this.redisService.dropTempData(filter.id)
      return 'update successful'
    }
    else return 'update unsuccessful'
  }


}
