import { Injectable } from '@nestjs/common';
import { User } from './model/User.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class UserService {

    constructor(
        @InjectModel(User)
        private userModel: typeof User,
    ){}

    
}
