import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Roles } from './model/roles.model';
import { InjectModel } from '@nestjs/sequelize';
import { where } from 'sequelize';

@Injectable()
export class RoleRepository {

    constructor() { }
    async create(createRoleDto: CreateRoleDto & {isActive:boolean}) {
        await Roles.create(createRoleDto)
        return 'role created successfully'
    }
    async findAll(): Promise<Roles[]> {
        return await Roles.findAll();
    }

    async findOne(id: string):Promise<Roles> {
        return await Roles.findOne({
          where: {role_id: id},
          attributes:['role_id'],
          raw: true
        });
    }
    async findRole(name: string): Promise<Roles> {
        const role = await Roles.findOne({
            where: { role: name },
            attributes: ['role_id'],
            raw: true
        });
        return role
    }

}
