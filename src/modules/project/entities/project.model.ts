import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
// import { Sprints } from './sprint.model'; // Adjust the import based on your project structure
import { User } from 'src/modules/user/model/User.model';
@Table({ tableName: 'Projects' })
export class Projects extends Model<Projects> {
  @Column({
    type: DataType.CHAR(36),
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  start_date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  end_date: Date;

//   @ForeignKey(() => Sprints)
//   @Column({
//     type: DataType.CHAR(36),
//     allowNull: true,
//   })
//   current_sprint_id: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  min_issue_count: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.CHAR(36),
    allowNull: true,
  })
  owned_by: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.CHAR(36),
    allowNull: true,
  })
  lead_by: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  is_active: boolean;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  created_at: Date;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  updated_at: Date;
}
