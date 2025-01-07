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
  async findProjectById(id: string): Promise<Projects> {
    const project = await this.projectRepository.findById(id)
    return project;
  }
  async findProjects(filter): Promise<Projects[]> {
    const project = await this.projectRepository.findbyFilter(filter)
    return project;
  }
  async createUserProject(data: UserProjectDTO): Promise<UserProject> {
    return await this.userProjectRepository.create(data);
  }
  async findUserProjects(filter:Partial<UserProjectDTO>): Promise<UserProject[]> {

    let condition = ''
    let filterProperties = Object.keys(filter)
    filterProperties.map((e,index)=>{
      condition += `${e} = '${filter[e]}'`
      if (filterProperties.length-1 !== index) condition += ' AND '
    })

    const result =  await this.userProjectRepository
    .rawQuery(
      `SELECT user_projects.isActive, p.name, p.id FROM user_projects LEFT JOIN projects p ON user_projects.projectId = p.id WHERE ${condition};`
    )
    return result;

  }
  async findUserProjectsByFilter(filter:Partial<UserProjectDTO>): Promise<UserProject[]> {
    const result =  await this.userProjectRepository.findByFilter(filter)
    return result;
  }
}
