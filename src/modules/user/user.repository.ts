import { Inject, Injectable } from '@nestjs/common';
import { User } from './model/User.model';
import { Model, Op, QueryTypes, Sequelize, WhereOptions } from 'sequelize';
import { Roles } from 'src/modules/role/model/roles.model';
import { RoleService } from 'src/modules/role/role.service';
import { RoleEnum } from 'src/modules/role/utility/roles.enum';
import { UserDTO } from '../auth/validator/signup.dto';
import { ProjectService } from '../project/project.service';
import { UUID } from 'crypto';
import { BaseRepository } from 'src/common/repository.base';

@Injectable()
export class UserRepository extends BaseRepository<User>{
    constructor(){
        super(User)
    }
}
