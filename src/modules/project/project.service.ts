import { Injectable, NotFoundException } from '@nestjs/common';
import { Projects } from './entities/project.model';
import { UserProject } from './entities/userprojects.model';
@Injectable()
export class ProjectService {
  constructor(
  ) {}
  async createProject(data: Partial<Projects>): Promise<Projects> {
    return await Projects.create(data);
  }
  async createUserProject(data: Partial<UserProject>): Promise<UserProject> {
    return await UserProject.create(data);
  }


  async findProjectById(id: string): Promise<Projects> {
    const project = await Projects.findOne({ where: { id }, attributes:['name'] });
    return project;
  }

}
