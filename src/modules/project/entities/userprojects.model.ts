import { BelongsTo, Column, DataType, Default, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Projects } from 'src/modules/project/entities/project.model';
import { User } from 'src/modules/user/model/User.model';
import { Roles } from 'src/modules/role/model/roles.model';

@Table({
  tableName: 'user_projects',
  timestamps: false,
})
export class UserProject extends Model<UserProject> {
  @Column({
    type: DataType.CHAR(36),
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  id: string;

  @ForeignKey(() => Projects)
  @Column({
    type: DataType.CHAR(36),
    allowNull: false,
  })
  projectId: string;
  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Projects)
  project: Projects;

  @ForeignKey(() => User)
  @Column({
    type: DataType.CHAR(36),
    allowNull: false,
  })
  userId: string;

  @ForeignKey(() => Roles)
  @Column({
    type: DataType.CHAR(36),
    allowNull: false,
  })
  roleId: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive?: boolean;
}
export type UserProjectType = typeof UserProject
