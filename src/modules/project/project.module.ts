import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { Projects } from './entities/project.model';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { UserProject } from './entities/userprojects.model';
import { ProjectRepository } from './project.repository';
import { UserProjectRepository } from './userProject.repository';
import { UserProjectService } from './userProject.service';

@Module({
  imports:[
    SequelizeModule.forFeature([Projects,UserProject])
],
  controllers: [ProjectController],
  providers: [ProjectService,ProjectRepository, UserProjectRepository,UserProjectService],
  exports: [ProjectService,UserProjectService]
})
export class ProjectModule {}
