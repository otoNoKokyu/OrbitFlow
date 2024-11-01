import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Roles } from './model/roles.model';
import { InjectModel } from '@nestjs/sequelize';
import { where } from 'sequelize';

@Injectable()
export class RoleService {

  constructor() { }
  async create(createRoleDto: CreateRoleDto) {
    const doesExist = await Roles.findOne({
      where: { ...createRoleDto }
    })
    if (doesExist) throw new Error('role already exist')
    await Roles.create({ ...createRoleDto, isActive: true })
    return 'role created successfully'
  }

  findAll() {
    return `This action returns all role`;
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }
  async findRole(name: string): Promise<any> {
    const role = await Roles.findOne({
      where: { role: name },
      attributes: ['role_id'],
      raw:true
    });
    return role
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
