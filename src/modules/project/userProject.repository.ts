import { Injectable} from '@nestjs/common';
import { UserProject } from './entities/userprojects.model';
import { BaseRepository } from 'src/common/repository.base';
import { ModelAttributes } from 'src/common/interface/IBase';
import { fetchUserProjects } from './rawQueries';
import { Projects } from './entities/project.model';
import { User } from '../user/model/User.model';
import { Roles } from '../role/model/roles.model';
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
}
