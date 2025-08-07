import {Inject, Injectable } from '@nestjs/common';
import { Projects } from './entities/project.model';
import { ProjectRepository } from './project.repository';
import { BaseService } from 'src/common/service.base';
import { ModelAttributes, ModelCreationAttributes } from 'src/common/interface/IBase';
import { UserProjectService } from './userProject.service';
import { isNotEmptyObject } from 'class-validator';
import { isEmptyObject } from 'src/utility/NullishUtills';
import { ServiceException } from 'src/helper/CustomError';
import { ERR_TYPE } from 'src/interface/CustomError';
import { TransactionManagerService } from 'src/helper/transaction.manager';
@Injectable()
export class ProjectService extends BaseService<Projects> {
  constructor(
    private projectRepository:ProjectRepository,
    private userProjectService: UserProjectService,
    private transactionManager: TransactionManagerService,
    @Inject('ServiceException') private serviceException: ServiceException<ERR_TYPE>,
  
  ) {
    super(projectRepository)
  }
  async create(body: ModelCreationAttributes<Projects>, meta?:{userId:string,roleId:string}){
    const project = this.projectRepository.findOne(body)
    if(!isEmptyObject(project)) throw this.serviceException.throw('RESOURCE_CONFLICT', 'project already exists')
    const createdProject = await this.projectRepository.create(body)
    if(meta && meta.userId && meta.roleId){
        this.userProjectService.create({
          isActive:true,
          roleId:meta.roleId,
          projectId: createdProject.id,
          userId:meta.userId
        })
    }
    return createdProject
  }
}
