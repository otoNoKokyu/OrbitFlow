import { Inject, Injectable } from '@nestjs/common';
import { Projects } from './entities/project.model';
import { UserProject } from './entities/userprojects.model';
import { ProjectsDto } from './dto/create-project.dto';
import { ProjectRepository } from './project.repository';
import { UserProjectRepository } from './userProject.repository';
import { UserProjectDTO } from './dto/create-user-project.dto';
@Injectable()
export class ProjectService {
  constructor(
     private projectRepository:ProjectRepository,
     private userProjectRepository:UserProjectRepository
  ) {}
  async createProject(data: Projects): Promise<Projects> {
    const x =  await this.projectRepository.create(data);
    return x;
  }
  async createUserProject(data: UserProjectDTO): Promise<UserProject> {
    return await this.userProjectRepository.create(data);
  }
  async findProjectById(id: string): Promise<Projects> {
    const project = await this.projectRepository.findById(id)
    return project;
  }
  async findProjects(filter): Promise<Projects[]> {
    const project = await this.projectRepository.findbyFilter(filter)
    return project;
  }
  async findUserProjects(filter:Partial<UserProjectDTO>): Promise<UserProject[]> {
    const result =  await this.userProjectRepository
    .rawQuery(
      `SELECT * FROM user_projects 
        WHERE projectId = '${filter.projectId}' AND roleId = '${filter.roleId}';
    `
    )
    return result;
  }


}
