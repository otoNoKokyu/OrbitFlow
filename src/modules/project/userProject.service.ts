import { Injectable } from '@nestjs/common';
import { UserProjectRepository } from './userProject.repository';
import { BaseService } from 'src/common/service.base';
import { UserProject } from './entities/userprojects.model';
@Injectable()
export class UserProjectService extends BaseService<UserProject> {
    constructor(private userProjectRepository: UserProjectRepository) 
    {
        super(userProjectRepository)
    }
}
