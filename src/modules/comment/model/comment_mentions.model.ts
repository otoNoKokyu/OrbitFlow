import { Table, Column, Model, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript';
import { Comment } from './comment.model';
import { User } from '../../user/model/User.model';

@Table({ tableName: 'comment_mentions', timestamps: false })
export class CommentMention extends Model<CommentMention> {
  
  @Column({ primaryKey: true, type: 'UUID', defaultValue: DataType.UUIDV4 })
  id: string;

  @ForeignKey(() => Comment)
  @Column({ type: 'UUID', allowNull: false })
  comment_id: string;

  @ForeignKey(() => User)
  @Column({ type: 'UUID', allowNull: false })
  mentioned_user_id: string;

  @BelongsTo(() => User, { foreignKey: 'mentioned_user_id', as: 'mentionedUser' })
  mentionedUser: User;
}
