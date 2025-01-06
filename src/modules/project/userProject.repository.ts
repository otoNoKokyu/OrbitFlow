import { Injectable} from '@nestjs/common';
import { UserProject } from './entities/userprojects.model';
import { WhereOptions } from 'sequelize';
@Injectable()
export class UserProjectRepository {
  constructor(
  ) {}

  async create(data: Partial<UserProject>): Promise<UserProject> {
    return await UserProject.create(data);
  }
  async rawQuery(query:string): Promise<UserProject[]> {
    let result =  await UserProject.sequelize.query(query)
    return result  as UserProject[]
  }
  async findOne(data:WhereOptions<Partial<UserProject>>): Promise<UserProject>{
      return await UserProject.findOne({where:data})
  }

}
