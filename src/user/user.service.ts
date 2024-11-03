import { Inject, Injectable } from '@nestjs/common';
import { User } from './model/User.model';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Roles } from 'src/role/model/roles.model';
// import { RoleEnum } from 'src/role/utility/roles.enum';
import { RoleService } from 'src/role/role.service';
import { RoleEnum } from 'src/role/utility/roles.enum';

@Injectable()
export class UserService {


    constructor(
        @Inject(RoleService)
        private roleService: RoleService
    ){}
    
    async findOne(id:string):Promise<User | null>{
        const user = await User.findOne({
            where: { user_id: id }
        });
        return user
    }
    async findByCredential (credential : Partial<User>):Promise<User | null>{
        const user = await User.findOne({
            where: credential,
            include: [{ model: Roles }],
        })
        return user
    }
    async findDuplicateUser ({username,email,phone_number,first_name}: Partial<User>): Promise<Boolean>{
        const user = await User.findAll({
            where: {
                [Op.or] : [{username},{email},{phone_number},{first_name}]
            }
        })
        if(user.length) return true
        else return false
    }
    async createUser(user: Partial<User>, assigned_role: RoleEnum):Promise<void> {
        const roleExists = await this.roleService.findRole(assigned_role)
        if(!roleExists) throw Error('No role found')
        await User.create({...user, roleId: roleExists.role_id})
    }
    async updateUserTokens(access_token:string,refresh_token:string, userId: string):Promise<void>{

        await User.update(
            { access_token,refresh_token },
            { where: { user_id: userId } }
        );    
    }    
}
