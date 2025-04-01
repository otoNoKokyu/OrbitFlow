import {Injectable } from '@nestjs/common';
import { User } from './model/User.model';
import { BaseRepository } from 'src/common/repository.base';
import { EntityAttributes } from 'src/common/interface/IBase';
import { Op } from 'sequelize';

@Injectable()
export class UserRepository extends BaseRepository<User>{
    constructor(){
        super(User)
    }
    async findBulkByProperty<K extends keyof EntityAttributes<User>>(
        entity: K,
        value: EntityAttributes<User>[K][]
      ): Promise<User[]> {
        return this.model.findAll({
          where: {
            [entity]: { [Op.in]: value }
        }
        });
      }
}
