import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany
} from 'sequelize-typescript';
import { Projects } from 'src/modules/project/entities/project.model';
import { User } from 'src/modules/user/model/User.model';
import { Comment } from 'src/modules/comment/model/comment.model';

@Table({ tableName: 'issues', timestamps: true })
export class Issue extends Model<Issue> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  projectIssueId: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  estimate: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  remaining: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  loggedTime: number;

  @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: true })
  attachments: string[];

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  assigneeId: string;

  @BelongsTo(() => User, 'assigneeId')
  assignee: User;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  reporterId: string;
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  createdBy: string;

  @BelongsTo(() => User, 'reporterId')
  creator: User;
  @BelongsTo(() => User, 'reporterId')
  reporter: User;

  @Column({ type: DataType.STRING, allowNull: false })
  status: string;

  @Column({ type: DataType.STRING, allowNull: true })
  priority: string;

  @ForeignKey(() => Projects)
  @Column({ type: DataType.UUID, allowNull: false })
  projectId: string;

  @BelongsTo(() => Projects)
  project: Projects;

  @Column({ type: DataType.UUID, allowNull: true })
  sprintId: string;

  @Column({ type: DataType.DATE, allowNull: true })
  dueDate: Date;

  @Column({
    type: DataType.ENUM('task', 'subtask', 'epic', 'story'),
    allowNull: false,
  })
  type: string;

  @ForeignKey(() => Issue)
  @Column({ type: DataType.UUID, allowNull: true })
  parentId: string;

  @BelongsTo(() => Issue)
  parent: Issue;

  @HasMany(() => Comment, 'issue_id')
  comments: Comment[];


}
