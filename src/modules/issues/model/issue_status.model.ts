import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { Projects } from 'src/modules/project/entities/project.model';

@Table({ tableName: 'issue_statuses' })
export class IssueStatus extends Model<IssueStatus> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status: string;

  @ForeignKey(() => Projects)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  projectId: string;
}
