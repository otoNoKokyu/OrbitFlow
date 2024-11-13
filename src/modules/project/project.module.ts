import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { Projects } from './entities/project.model';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { UserProject } from './entities/userprojects.model';

@Module({
  imports:[SequelizeModule.forFeature([Projects,UserProject])],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService]
})
export class ProjectModule {}
