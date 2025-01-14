import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto, ProjectsDto } from './dto/create-project.dto';
import { UserProjectDTO } from './dto/create-user-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { RoleEnum } from '../role/utility/roles.enum';
import { Role } from 'src/decorators/role.decorator';
import { Projects } from './entities/project.model';
import { UserProjectService } from './userProject.service';
import { EntityAttributes, ModelCreationAttributes } from 'src/common/interface/IBase';
import { UserProject } from './entities/userprojects.model';

@Controller('project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly userProjectService: UserProjectService

  ) {}

  @Role(RoleEnum.ADMIN)
  @Post('/')
  @UsePipes(new ValidationPipe())
  public async create(
    @Body() body: ModelCreationAttributes<Projects>,
    @Req() { user }: { user: { userId: string; roleId: string } }
  ) {
      const data = await this.projectService.create(body);
      const { userId, roleId } = user;
      const project = await this.projectService.create(data,{userId,roleId});
      return project;
  }

  @Get('/userProjects')
  public async getUserProjects(
    @Query() query: EntityAttributes<UserProject>
  ) {
    const data = await this.userProjectService.findAll(query)
    return data;
  }
  @Role(RoleEnum.ADMIN)
  @Get('/')
  public async getProjectsByFilter(
    @Query() query: EntityAttributes<Projects>
  ) {
    const data = await this.projectService.findAll(query);
    return data;
  }
}
