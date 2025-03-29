import { Injectable } from '@nestjs/common';
import { MailService } from 'src/utility/mail/mail.service';
import { Recipient, NotificationIssueType, NotificationType } from './types/notification.types';
import { EntityAttributes } from 'src/common/interface/IBase';
import { Issue } from '../issues/model/issue.model';


@Injectable()
export class NotificationService {
    constructor(private readonly mailService: MailService){}

    private async  sendIssueNotification(recipient: string, issue: NotificationIssueType ){
        return await this.mailService.sendIssueNotification(recipient,issue)
    }
    public getIssueDataForNotification(issue: EntityAttributes<Issue>):NotificationIssueType{
        const {projectIssueId,name, assignee:{first_name: aFn}, reporter:{first_name:rFn}, status, updatedAt, comments} = issue
        return {
            projectIssueId,
            title:name,
            assignee:aFn,
            reporter: rFn,
            status,
            updatedOn:new Date(updatedAt).toLocaleDateString(),
        }
    }
    public async recieveNotification(notification:NotificationType,details:any,recipient:string){

        switch(notification){
            case NotificationType.ISSUE_CHANGE:
                await this.sendIssueNotification(recipient, this.getIssueDataForNotification(details) )
        }
    }
}
