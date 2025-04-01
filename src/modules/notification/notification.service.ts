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
    public getIssueDataForNotification(issue: EntityAttributes<Issue> & {comment?:string}):NotificationIssueType{
        const {
            projectIssueId = '',
            name = '',
            assignee,
            reporter,
            comment = '',
            status = '',
            updatedAt = '',
          } = issue || {};
          
          const aFn = assignee?.first_name || '';
          const rFn = reporter?.first_name || '';       
           return {
            projectIssueId,
            title:name,
            assignee:aFn,
            reporter: rFn,
            comment,
            status,
            updatedOn:updatedAt? new Date(updatedAt).toLocaleDateString(): '',
        }
    }
    public async recieveIssueNotification(recipients:string[],details:Partial<Issue> & {comment?:string}, prevDetails?:Partial<Issue> ){
        const allEmailSendings = recipients.map(e=>this.sendIssueNotification(e, this.getIssueDataForNotification(details),this.getIssueDataForNotification(prevDetails)))
        return await Promise.allSettled(allEmailSendings).catch(err=>console.error(err))
    }
}
