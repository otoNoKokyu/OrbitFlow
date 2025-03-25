import { Table, Column, Model, DataType, ForeignKey, AllowNull } from 'sequelize-typescript';
import { Projects } from 'src/modules/project/entities/project.model';

@Table({ tableName: 'issue_status' })
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

  @Column({
    type: DataType.NUMBER,
    allowNull:false
  })
  level:number;

  @ForeignKey(() => Projects)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  projectId: string;
}
