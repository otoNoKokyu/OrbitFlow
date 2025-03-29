import { Injectable } from '@nestjs/common';
import { MailService } from 'src/utility/mail/mail.service';
import { Recipient, NotificationIssueType, NotificationType } from './types/notification.types';
import { EntityAttributes } from 'src/common/interface/IBase';
import { Issue } from '../issues/model/issue.model';


@Injectable()
export class NotificationService {
    constructor(private readonly mailService: MailService){}

    private async  sendIssueNotification(recipient: string, issue: NotificationIssueType, prevIssue?: NotificationIssueType){
        Object.keys(issue).forEach((e)=>{
            if(!issue[e] && e !== 'projectIssueId') {
                delete issue[e]
                delete prevIssue[e]
            }
        })
        return await this.mailService.sendIssueNotification(recipient,issue,prevIssue)
    }
    public getIssueDataForNotification(issue: EntityAttributes<Issue>):NotificationIssueType{
        const {
            projectIssueId = '',
            name = '',
            assignee,
            reporter,
            status = '',
            updatedAt = '',
            comments = ''
          } = issue || {};
          
          const aFn = assignee?.first_name || '';
          const rFn = reporter?.first_name || '';       
           return {
            projectIssueId,
            title:name,
            assignee:aFn,
            reporter: rFn,
            status,
            updatedOn:updatedAt? new Date(updatedAt).toLocaleDateString(): '',
        }
    }
    public async recieveIssueNotification(recipient:string,details:Partial<Issue>, prevDetails?:Partial<Issue> ){
        return await this.sendIssueNotification(recipient, this.getIssueDataForNotification(details),this.getIssueDataForNotification(prevDetails))

    }
}
