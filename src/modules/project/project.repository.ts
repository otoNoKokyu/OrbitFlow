import { Injectable } from '@nestjs/common';
import { Projects } from './entities/project.model';

@Injectable()
export class ProjectRepository {
  constructor() {}
  async create(data: Projects): Promise<Projects> {
    const x =  await Projects.create(data);
    return x;
  }
  async findById(id: string): Promise<Projects> {
    const project = await Projects.findOne({ where: { id }, attributes:['name'] });
    return project;
  }
  async findbyFilter(filter): Promise<Projects[]> {
    const project = await Projects.findAll({ where: { ...filter }, attributes:['id','name','owned_by', 'lead_by'] });
    return project;
  }

}
