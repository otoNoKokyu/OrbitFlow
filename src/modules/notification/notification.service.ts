import { Injectable } from '@nestjs/common';
import { MailService } from 'src/utility/mail/mail.service';
import { Recipient, NotificationIssueType } from './types/notification.types';
import { AtLeastOneAttribute, EntityAttributes } from 'src/common/interface/IBase';
import { Issue } from '../issues/model/issue.model';
import { OnEvent } from '@nestjs/event-emitter';
import { IssueRepository } from '../issues/issue.repository';
import { NotificationType } from '../shared/shared.types';
import { isEmptyObject, isUUID } from 'src/utility/NullishUtills';
import { UserRepository } from '../user/user.repository';


@Injectable()
export class NotificationService {
    constructor(
        private readonly mailService: MailService,
        private readonly issueRepository: IssueRepository,
        private readonly userRepo: UserRepository,
    ) { }

    @OnEvent(NotificationType.ISSUE_CREATE)
    private async handleIssueCreate(issue: EntityAttributes<Issue>) {
        const popultaedIssue = await this.issueRepository.findIssueForNotification(issue.id);
        await this.recieveIssueNotification([popultaedIssue.assignee.email], popultaedIssue)
    }
    @OnEvent(NotificationType.ISSUE_ATTRIBUTES_CHANGE)
    private async handleIssueUpdate(issue: AtLeastOneAttribute<Issue>, storedIssue: EntityAttributes<Issue>) {
        const recipients = this.resolveNotificationRecipient(storedIssue)
        const notificationBody = await this.resolveNotificationBody(issue)
        if (recipients.length) return await this.recieveIssueNotification(recipients, notificationBody, storedIssue)
        else return
    }
    @OnEvent(NotificationType.ISSUE_COMMENT_CHANGE)
    private async handleCommentUpdate({comment,emails,issueId}:{issueId:string, emails: string[], comment:  string }) {
        const [usersEmail, issue] = await Promise.all(
            [this.userRepo.findBulkByProperty('user_id', emails),
            this.issueRepository.findOne({ id: issueId}, null, ['projectIssueId'])
            ]
          )
        return await this.recieveIssueNotification(usersEmail.map(e=>e.email), {comment,projectIssueId:issue.projectIssueId})
    }
    private resolveNotificationRecipient(body: EntityAttributes<Issue>) {
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
        if (!assigneeId && !reporterId) return body
        const promiseArr = []
        if (assigneeId) promiseArr.push(this.userRepo.findOne({ user_id: assigneeId }))
        if (reporterId) promiseArr.push(this.userRepo.findOne({ user_id: reporterId }))
        const [assignee, reporter] = await Promise.all(promiseArr)
        return { ...body, assignee, reporter };

    }

    private async sendIssueNotification(recipient: string, issue: NotificationIssueType, prevIssue?: NotificationIssueType) {
        if (!prevIssue) prevIssue = {} as NotificationIssueType;

        Object.keys(issue).forEach((key) => {
            if (!issue[key] && key !== 'projectIssueId') {
                delete issue[key];
                if (prevIssue[key]) {
                    delete prevIssue[key];
                }
                return;
            }

            // Check if there are any changes
            if (issue[key] === prevIssue[key]) {
                delete issue[key];
                delete prevIssue[key];
            }
        });

        if (Object.keys(issue).length > 1) {
            return await this.mailService.sendIssueNotification(recipient, issue, prevIssue);
        } else {
            return;
        }


    }

    public getIssueDataForNotification(issue: EntityAttributes<Issue> & { comment?: string }): NotificationIssueType {
        if (isEmptyObject(issue)) return
        const {
            projectIssueId,
            name,
            assignee,
            reporter,
            comment,
            status,
            updatedAt,
        } = issue

        const aFn = assignee?.first_name;
        const rFn = reporter?.first_name;
        return {
            projectIssueId,
            title: name,
            assignee: aFn,
            reporter: rFn,
            comment,
            status,
            updatedOn: updatedAt ? new Date(updatedAt).toLocaleDateString() : '',
        }
    }
    public async recieveIssueNotification(recipients: string[], details: Partial<Issue> & { comment?: string }, prevDetails?: Partial<Issue>) {
        console.log(recipients);
        const allEmailSendings = recipients.map(e => this.sendIssueNotification(e, this.getIssueDataForNotification(details), this.getIssueDataForNotification(prevDetails)))
        return await Promise.allSettled(allEmailSendings).catch(err => console.error(err))
    }
}
