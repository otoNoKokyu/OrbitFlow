import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto, ProjectsDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { EligbleInviteRole, RoleEnum } from '../role/utility/roles.enum';
import { Role } from 'src/decorators/role.decorator';
import { Projects } from './entities/project.model';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Role([RoleEnum.ADMIN])
  @Post('/')
  private async createProject(
    @Body() body: ProjectsDto
  ) {
    const data = await this.projectService.createProject(body as unknown as Projects)
    return data
  }
  @Role([RoleEnum.ADMIN])
  @Get('/')
  private async getProjectsByFilter(
    @Query() query: ProjectsDto
  ) {
    const data = await this.projectService.findProjects(query)
    return data
  }

}
