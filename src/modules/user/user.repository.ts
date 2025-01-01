import { Inject, Injectable } from '@nestjs/common';
import { User } from './model/User.model';
import { Op, Sequelize, WhereOptions } from 'sequelize';
import { Roles } from 'src/modules/role/model/roles.model';
import { RoleService } from 'src/modules/role/role.service';
import { RoleEnum } from 'src/modules/role/utility/roles.enum';
import { UserDTO } from '../auth/dto/signup.dto';
import { ProjectService } from '../project/project.service';
import { UUID } from 'crypto';

@Injectable()
export class UserRepository {
    constructor(
    ) { }

    async findOne(payload: WhereOptions<Partial<User>>): Promise<User | null> {
        return await User.findOne({
            where: payload
        });
    }
    // async findByCredential(query: Partial<User> | string,): Promise<User | null> {
    //         return  await User.findOne({
    //             where: query,
    //             include: [{ model: Roles }],
    //         })

    // }
    async findByFilter(payload: WhereOptions<Partial<User>>): Promise<User[]> {
        return await User.findAll({
            where: payload
        })
    }
    // async findOneById(id: UUID): Promise<User> {
    //     const userData = await User.findOne({
    //         where: { user_id: id }
    //     })
    //     if (!userData) throw Error('user not found')
    //     return userData

    // }
    async updateUser({payload,condition}:{payload:Partial<User>, condition: WhereOptions<Partial<User>> }): Promise<void> {
        await User.update(
            payload,
            { where: condition}
        );
    }
}
