import { EntityAttributes } from "src/common/interface/IBase";
import { Issue } from "../model/issue.model";

export type TUpdateIssue = Pick<EntityAttributes<Issue>, | 'description' | 'estimate' | 'name' |  'reporterId'| 'status' | 'priority' | 'loggedTime'| 'assigneeId'>