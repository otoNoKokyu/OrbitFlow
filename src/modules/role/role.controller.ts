import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { BaseController } from 'src/common/controller.base';
import { Roles } from './model/roles.model';
import { RoleRepository } from './role.repository';

@Controller('role')
export class RoleController extends BaseController<Roles> {
  constructor( roleService: RoleService) {
    super(roleService)
  }
}
