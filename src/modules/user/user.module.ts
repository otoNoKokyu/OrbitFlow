import { Module } from '@nestjs/common';
import { UserService, usersProviders } from './user.service';
import { User } from './model/User.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserController } from './user.controller';
import { RoleModule } from 'src/modules/role/role.module';
import { ProjectService } from '../project/project.service';
import { RolesGuard } from 'src/guards/role.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    RoleModule
  ],
  providers: [UserService,ProjectService, {provide: APP_GUARD, useClass: RolesGuard}, ...usersProviders],
  exports: [UserService],
  controllers: [UserController]
})
export class UserModule {}
