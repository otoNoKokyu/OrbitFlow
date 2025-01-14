import { Injectable} from '@nestjs/common';
import { UserProject } from './entities/userprojects.model';
import { BaseRepository } from 'src/common/repository.base';
@Injectable()
export class UserProjectRepository extends BaseRepository<UserProject> {
  constructor() {
    super(UserProject)
  }
}
