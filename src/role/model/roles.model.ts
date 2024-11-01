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
  } from 'sequelize-typescript';

import { RoleEnum } from '../utility/roles.enum'
  import { v4 as uuidv4 } from 'uuid';
  @Table({ tableName: 'roles' , timestamps: true})
  export class Roles extends Model<Roles> {
    @PrimaryKey
    @Default(uuidv4)
    @Unique
    @Column(DataType.UUID) 
    role_id: string;
  
    @Unique
    @AllowNull(false)
    @Column({
        type: DataType.ENUM('GUEST','DEV','MANAGER','LEAD','PRODUCT_OWNER','QA','ADMIN'),
        allowNull: false
    })
    role: RoleEnum;
  
    @Column(DataType.BOOLEAN)
    isActive: boolean;
  
    @CreatedAt
    @Column(DataType.DATE)
    createdAt: Date;
  
    @UpdatedAt
    @Column(DataType.DATE)
    updatedAt: Date;
    
  }


  