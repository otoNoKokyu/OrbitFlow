import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Issue } from "src/modules/issues/model/issue.model";
import { User } from "src/modules/user/model/User.model";

@Table({ tableName: 'comments',timestamps:true })
export class Comment extends Model<Comment> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Issue)
  @Column({ type: DataType.UUID, allowNull: false })
  issue_id: string;

  @ForeignKey(() => Comment)
  @Column({ type: DataType.UUID, allowNull: true })
  parent_comment_id: string;

  @BelongsTo(() => Comment)
  parentComment: Comment;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  author_id: string;

  @BelongsTo(() => User)
  author: User;

  @Column({ type: DataType.TEXT, allowNull: false })
  content: string;

  @Column({ type: DataType.DATE })
  createdAt: Date;

  @Column({ type: DataType.DATE })
  updatedAt: Date;
}
