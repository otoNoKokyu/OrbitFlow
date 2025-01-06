import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleRepository } from './role.repository';
import { RoleController } from './role.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Roles } from './model/roles.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Roles])],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository],
  exports: [RoleService]
})
export class RoleModule { }
