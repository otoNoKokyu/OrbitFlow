import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto, ProjectsDto } from './dto/create-project.dto';
import { UserProjectDTO } from './dto/create-user-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { RoleEnum } from '../role/utility/roles.enum';
import { Role } from 'src/decorators/role.decorator';
import { Projects } from './entities/project.model';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Role(RoleEnum.ADMIN)
  @Post('/')
  @UsePipes(new ValidationPipe())
  public async createProject(
    @Body() body: ProjectsDto,
    @Req() { user }: { user: { userId: string; roleId: string } }
  ) {
    try {
      const data = await this.projectService.createProject(body as unknown as Projects);
      const { userId, roleId } = user;
      await this.projectService.createUserProject({
        projectId: data.id,
        userId,
        roleId,
        isActive: true
      });
      return { message: 'Project created', projectId: data.id };
    } catch (error) {
      throw new Error('Error creating project');
    }
  }

  @Get('/userProjects')
  public async getUserProjects(
    @Query() query: any
  ) {
    console.log("jdsbs",query)
    const data = await this.projectService.findUserProjects(query);
    return data;
  }

  @Role(RoleEnum.ADMIN)
  @Get('/')
  public async getProjectsByFilter(
    @Query() query: any
  ) {
    const data = await this.projectService.findProjects(query);
    return data;
  }
}
