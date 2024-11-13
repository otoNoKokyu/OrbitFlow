import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './model/User.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserController } from './user.controller';
import { RoleModule } from 'src/modules/role/role.module';
import { ProjectService } from '../project/project.service';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    RoleModule
  ],
  providers: [UserService,ProjectService],
  exports: [UserService],
  controllers: [UserController]
})
export class UserModule {}
