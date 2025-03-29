export type Recipient = {
    email: string;
    name?: string;
}
export type NotificationIssueType = {
    projectIssueId: string
    title?: string;
    assignee?: string;
    reporter?: string;
    status?: string;
    updatedOn?: string;
    comment?: string
}
export enum NotificationType  {
    ISSUE_CHANGE = 'Issue changes'
}