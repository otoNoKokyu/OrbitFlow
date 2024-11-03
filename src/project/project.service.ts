import { Injectable, NotFoundException } from '@nestjs/common';
import { Projects } from './entities/project.model';
@Injectable()
export class ProjectService {
  constructor(
  ) {}
  async createProject(data: Partial<Projects>): Promise<Projects> {
    return Projects.create(data);
  }

  async findProjectById(id: string): Promise<Projects> {
    const project = await Projects.findOne({ where: { id }, attributes:['name'] });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }
}
