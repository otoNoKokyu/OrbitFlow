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


@Injectable()
export class IssuesService extends BaseService<Issue> {
  constructor(
    private IssueRepository: IssueRepository,
    private projectRepository: ProjectRepository,
    @Inject('serviceException') private serviceException: ServiceException<ERR_TYPE>,
    private readonly notificationService: NotificationService,
    private readonly redisService: RedisService,
    private readonly userRepo: UserRepository

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

  private async findIssueForNotification(id: string) {
    return await this.IssueRepository.findOne(
      { id },
      ['assignee', 'reporter'],
      ['projectIssueId', 'name', 'status', 'updatedAt'])
  }

  async create(data: ModelCreationAttributes<Issue>) {
    const existingIssue = await this.IssueRepository.findOne({ name: data.name, projectId: data.projectId, type: data.type })
    if (existingIssue) throw this.serviceException.throw('RESOURCE_CONFLICT', 'Issue already exists')
    const projectIssueId = await this.getIssueProjectId(data)
    const issue = await this.IssueRepository.create({ ...data, projectIssueId })
    const popultaedIssue = await this.findIssueForNotification(issue.id)
    if (popultaedIssue) this.redisService.setTempData(issue.id, popultaedIssue, 7200)
    await this.notificationService.recieveIssueNotification([popultaedIssue.assignee.email], popultaedIssue)
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
    if (!storedData) storedData = await this.findIssueForNotification(filter.id)

    if (body.loggedTime || body.estimate) {
      const issue = await this.IssueRepository.findOne({ id: filter.id }, null, ['loggedTime', 'estimate'])
      const remaining = (body?.estimate ?? (issue.estimate || 0)) - (body?.loggedTime ?? (issue?.loggedTime || 0))
      body.remaining = remaining
    }
    const [affectedCount] = await this.IssueRepository.update(filter, body);
    if (affectedCount > 0) {
      const recipients = await this.resolveNotificationRecipient(storedData)
      const notificationBody = await this.resolveNotificationBody(body)
      if (recipients.length) await this.notificationService.recieveIssueNotification(recipients, notificationBody, storedData)
      await this.redisService.dropTempData(filter.id)
      return 'update successful'
    }
    else return 'update unsuccessful'
  }
  private async resolveNotificationRecipient(body: EntityAttributes<Issue>) {
    const recipientEmails: string[] = []
    const { assignee, reporter, comments } = body
    if (!isEmptyObject(assignee)) recipientEmails.push(assignee.email)
    if (!isEmptyObject(reporter)) recipientEmails.push(reporter.email)
    if (comments?.length) {
      comments.forEach((e) => {
        e.mentions.forEach(f => {
          recipientEmails.push(f.mentionedUser.email)
        })
      })
    }
    return recipientEmails

  }
  private async resolveNotificationBody(body: AtLeastOneAttribute<Issue>) {
    const { assigneeId, reporterId } = body
    if(!assigneeId && !reporterId ) return body
    const promiseArr = []
    if(assigneeId) promiseArr.push(this.userRepo.findOne({user_id:assigneeId}))
    if(reporterId) promiseArr.push(this.userRepo.findOne({user_id:reporterId}))
    const [assignee, reporter] = await Promise.all(promiseArr)
    return {...body,assignee,reporter};

  }
}
