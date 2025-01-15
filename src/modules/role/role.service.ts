import { Inject, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Roles } from './model/roles.model';
import { RoleRepository } from './role.repository';
import { BaseService } from 'src/common/service.base';

@Injectable()
export class RoleService extends BaseService<Roles> {

  constructor( private roleRepository: RoleRepository) {
    super(roleRepository)
   }
}
