import { Injectable} from '@nestjs/common';
import { UserProject } from './entities/userprojects.model';
import { BaseRepository } from 'src/common/repository.base';
import { ModelAttributes } from 'src/common/interface/IBase';
import { fetchUserProjects } from './rawQueries';
import { Projects } from './entities/project.model';
import { User } from '../user/model/User.model';
import { Roles } from '../role/model/roles.model';
import { WhereOptions } from 'sequelize';
@Injectable()
export class UserProjectRepository extends BaseRepository<UserProject> {
  constructor() {
    super(UserProject)
  }
  async findAll (query?: ModelAttributes<UserProject>) : Promise<ModelAttributes<UserProject>[]>{
    let whereLiteral = ''
    const queryEntries = Object.entries(query)
    queryEntries?.map(([field,val],index)=>{
      whereLiteral += field === 'isActive' ? `user_projects.${field} = ${val ? 1 : 0}` : `user_projects.${field} = '${val}'`
      if(queryEntries.length - 1 === index) return
      whereLiteral += ' AND '
    })
    
    return this.rawQuery(fetchUserProjects(whereLiteral))
  }
    async findAll2(query?: Partial<ModelAttributes<UserProject>>): Promise<UserProject[]> {
    const where: WhereOptions = {};

    if (query) {
      for (const [field, value] of Object.entries(query)) {
        if (field === 'isActive') {
          where[field] = value ? 1 : 0;
        } else {
          where[field] = value;
        }
      }
    }

    const data = await this.model.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ['user_id', 'username', 'email']
        },
        {
          model: Projects,
          attributes: ['id', 'name']
        }
      ],
      raw: true,
      nest: true
    });
    return data;
  }
}
