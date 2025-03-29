import { Inject, Injectable } from '@nestjs/common';
import { Projects } from './entities/project.model';
import { ProjectRepository } from './project.repository';
import { BaseService } from 'src/common/service.base';
import { ModelCreationAttributes } from 'src/common/interface/IBase';
import { UserProjectService } from './userProject.service';
import { isEmptyObject } from 'src/utility/NullishUtills';
import { ServiceException } from 'src/helper/CustomError';
import { ERR_TYPE } from 'src/interface/CustomError';
import { IssueStatusRepository } from '../issues/issueStatus.repository';
@Injectable()
export class ProjectService extends BaseService<Projects> {
  constructor(
    private projectRepository: ProjectRepository,
    private userProjectService: UserProjectService,
    private issueStatusRepository: IssueStatusRepository,
    @Inject('ServiceException') private serviceException: ServiceException<ERR_TYPE>,

  ) {
    super(projectRepository)
  }

  async create(body: ModelCreationAttributes<Projects>, meta?: { userId: string, roleId: string }) {
    const project = this.projectRepository.findOne(body)
    if (!isEmptyObject(project)) throw this.serviceException.throw('RESOURCE_CONFLICT', 'project already exists')

      const transaction = await this.issueStatusRepository.sequelize.transaction();

      try {
        const createdProject = await this.projectRepository.create(body, transaction);
        await this.issueStatusRepository.createDefaultProjectStatus(createdProject.id, transaction);
        if (meta?.userId && meta?.roleId) {
          await this.userProjectService.create(
            {
              isActive: true,
              roleId: meta.roleId,
              projectId: createdProject.id,
              userId: meta.userId,
            },
            transaction
          );
        }
        await transaction.commit();
        return createdProject;
      } catch (error) {
        await transaction.rollback();
        throw this.serviceException.throw('RESOURCE_CONFLICT', 'could not create project');
      }
  }
}
