import {
  Column,
  Model,
  Table,
  PrimaryKey,
  Unique,
  AllowNull,
  Default,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Roles } from 'src/modules/role/model/roles.model';
import { v4 as uuidv4 } from 'uuid';
@Table({ tableName: 'users', timestamps: true })
export class User extends Model<User> {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID) @Column
  user_id: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(50))
  username: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  password_hash: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  email: string;

  @Column(DataType.STRING(50))
  first_name: string;

  @Column(DataType.STRING(50))
  last_name: string;

  @Column(DataType.DATE)
  date_of_birth: Date;

  @Column(DataType.ENUM('Male', 'Female', 'Other'))
  gender: 'Male' | 'Female' | 'Other';

  @Column(DataType.STRING(20))
  phone_number: string;

  @Column(DataType.TEXT)
  address: string;

  @Column(DataType.STRING(50))
  city: string;

  @Column(DataType.STRING(50))
  state: string;

  @Column(DataType.STRING(50))
  country: string;

  @Column(DataType.STRING(20))
  zip_code: string;

  @Column(DataType.STRING(255))
  profile_picture_url: string;

  @CreatedAt
  @Column(DataType.DATE)
  created_at: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updated_at: Date;

  @Column(DataType.DATE)
  last_login: Date;

  @Default(true)
  @Column(DataType.BOOLEAN)
  is_active: boolean;

  @Column(DataType.STRING)
  access_token: string;
  @Column(DataType.STRING)
  refresh_token: string

  @AllowNull(false)
  @ForeignKey(() => Roles)
  @Column(DataType.UUID)
  roleId: string;

  @BelongsTo(() => Roles)
  role: Roles;

 @Column({
  type: DataType.BOOLEAN,
  allowNull: false,
  defaultValue: false,
})
isInvited: boolean;

}

