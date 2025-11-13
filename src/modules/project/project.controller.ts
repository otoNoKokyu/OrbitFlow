import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProjectService } from './project.service';
// import { CreateProjectDto, ProjectsDto } from './dto/create-project.dto';
import { RoleEnum } from '../role/utility/roles.enum';
import { Role } from 'src/decorators/role.decorator';
import { Projects } from './entities/project.model';
import { EntityAttributes, ModelCreationAttributes } from 'src/common/interface/IBase';
import { JoiValidationPipe } from 'src/common/pipes/schema.validation.pipe';
import { creatProjectSchema, fetchAllProjectSchmea, issueStatusSchema } from './dto/project.dto';
import { IssueStatus } from '../issues/model/issue_status.model';

@Controller('project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
  ) {}
  // @Role([RoleEnum.PLATFORM_ADMIN,RoleEnum.ADMIN])
  @Post('/')
  @UsePipes(new JoiValidationPipe(creatProjectSchema))
  public async create(
    @Body() body: ModelCreationAttributes<Projects>,
    @Req() { user }: { user: { userId: string; roleId: string } }
  ) {
      const { userId, roleId } = user;
      const project = await this.projectService.create(body,{userId,roleId});
      return project;
  }

  @Get('/')
  @UsePipes(new JoiValidationPipe(fetchAllProjectSchmea))
  public async getProjectsByFilter(
    @Query() query: EntityAttributes<Projects>
  ) {
    const data = await this.projectService.findAll(query);
    return data;
  }

  @Role([RoleEnum.ADMIN])
  @Post('/status')
  @UsePipes(new JoiValidationPipe(issueStatusSchema))
  public async addIssueStatus(
    @Body() body: ModelCreationAttributes<IssueStatus>
  ) {
    const data = await this.projectService.createProjectStatus(body);
    return data;
  } 
  // @Get('/status')
  // public async fetchIssueStatus(
  // ) {
  //   const data = await this.projectService.fetchProjectStatus();
  //   return data;
  // }
}
