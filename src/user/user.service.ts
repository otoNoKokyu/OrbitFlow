import { Injectable } from '@nestjs/common';
import { User } from './model/User.model';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

@Injectable()
export class UserService {

    constructor(
        @InjectModel(User)
        private userModel: typeof User,
    ){}

    async findOne(id:string):Promise<User | null>{
        const user = await this.userModel.findOne({
            where: { user_id: id }
        });
        return user
    }
    async findByCredential (credential : Partial<User>):Promise<User | null>{
        const user = await this.userModel.findOne({
            where: credential
        })
        return user
    }
    async findDuplicateUser ({username,email,phone_number,first_name}: Partial<User>): Promise<Boolean>{
        const user = await this.userModel.findAll({
            where: {
                [Op.or] : [{username},{email},{phone_number},{first_name}]
            }
        })
        if(user.length) return true
        else return false
    }
    async createUser(user: Partial<User>):Promise<void> {
        await this.userModel.create(user)
    }
    async updateUserTokens(access_token:string,refresh_token:string, userId: string):Promise<void>{
        await this.userModel.update(
            { access_token,refresh_token },
            { where: { user_id: userId } }
        );    
    }    
}
