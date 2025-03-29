import { Inject, Injectable } from '@nestjs/common';
import { UserProjectRepository } from './userProject.repository';
import { BaseService } from 'src/common/service.base';
import { UserProject } from './entities/userprojects.model';
import { ModelAttributes, ModelCreationAttributes } from 'src/common/interface/IBase';
import { ServiceException } from 'src/helper/CustomError';
import { ERR_TYPE } from 'src/interface/CustomError';
import { fetchUserProjects, rqType } from './rawQueries';
import { InferAttributes, Transaction } from 'sequelize';
@Injectable()
export class UserProjectService extends BaseService<UserProject> {
    constructor(
        private userProjectRepository: UserProjectRepository,
        @Inject('ServiceException') private serviceException: ServiceException<ERR_TYPE>,
        
    ) 
    {
        super(userProjectRepository)
    }
  async create(body: ModelCreationAttributes<UserProject>,transaction?:Transaction): Promise<ModelAttributes<UserProject>> {
    const {projectId,roleId,userId,isActive} = body
    const doesExist =  await this.userProjectRepository.findOne({
        isActive,
        projectId,
        roleId,
        userId
    });
    if(doesExist) throw this.serviceException.throw('RESOURCE_CONFLICT','user already exist in project')
    return await this.userProjectRepository.create(body,transaction)
  }
  // async rawQuery(query?: string, type: rqType = 'fetchUserProject'): Promise<ModelAttributes<UserProject> | any> {
  //   if(type = 'fetchUserProject') return super.rawQuery(fetchUserProjects)
  // }
}
