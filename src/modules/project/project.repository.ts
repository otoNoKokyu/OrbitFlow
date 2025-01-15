import { Injectable } from '@nestjs/common';
import { Projects } from './entities/project.model';
import { BaseRepository } from 'src/common/repository.base';

@Injectable()
export class ProjectRepository extends BaseRepository<Projects> {
  constructor() {
    super(Projects)
  }
}
