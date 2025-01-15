import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Roles } from './model/roles.model';
import { InjectModel } from '@nestjs/sequelize';
import { where } from 'sequelize';
import { BaseRepository } from 'src/common/repository.base';

@Injectable()
export class RoleRepository extends BaseRepository<Roles> {
    constructor() {
        super(Roles)
    }
}
