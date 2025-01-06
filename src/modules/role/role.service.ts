import { Inject, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Roles } from './model/roles.model';
import { RoleRepository } from './role.repository';

@Injectable()
export class RoleService {

  constructor( private roleRepository: RoleRepository) { }
  async createRole(payload: CreateRoleDto) {
    const doesExist = await this.roleRepository.findRole(payload.role)
    if (doesExist) throw new Error('role already exist')
    await this.roleRepository.create({...payload, isActive:true})
    return 'role created successfully'
  }
  async findAll() {
    return await this.roleRepository.findAll()
  }
  async findOne(id: string) {
    return await this.roleRepository.findOne(id)
  }
  async findRole(name: string) {
    return await this.roleRepository.findRole(name)
  }


}
