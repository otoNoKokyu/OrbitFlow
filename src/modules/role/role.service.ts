import { Inject, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Roles } from './model/roles.model';
import { RoleRepository } from './role.repository';
import { BaseService } from 'src/common/service.base';
import { InferAttributes } from 'sequelize';
import { RoleEnum, RoleHierarchy } from './utility/roles.enum';
import { Op } from 'sequelize';

@Injectable()
export class RoleService extends BaseService<Roles> {

  constructor(private roleRepository: RoleRepository) {
    super(roleRepository)
  }
  async findRoleForAppropriateHierarchy(userRole: RoleEnum) {
    const userRoleHierarchy = RoleHierarchy[userRole]
    const permissableRoles = Object.entries(RoleHierarchy)
      .filter(([_, level]) => level < userRoleHierarchy)
      .map(([r]) => r as RoleEnum);
    
    const roles = await this.roleRepository.findAll({
      role: {
        [Op.in]: permissableRoles
      }
    })
    return roles

  }
}
