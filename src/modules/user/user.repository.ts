import { Injectable } from '@nestjs/common';
import { User } from './model/User.model';
import { BaseRepository } from 'src/common/repository.base';
import { EntityAttributes } from 'src/common/interface/IBase';
import { Includeable, Op, WhereOptions } from 'sequelize';
import { Roles } from '../role/model/roles.model';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor() {
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
  async findOne(
  where: WhereOptions<EntityAttributes<User>>,    
  include?: Includeable[] 
): Promise<User> {
  const result = await this.model.findOne({
    where,
    include: include ?? [],
    nest: true,
    raw: true
  });

  return result;
}
}
