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
import { BaseController } from 'src/common/controller.base';

@Controller('userproject')
export class UserProjectController extends BaseController<UserProject> {
  constructor(private readonly userProjectService: UserProjectService) {super(userProjectService)
}

  @Role([RoleEnum.ADMIN])
  public async create(
    @Body() body: ModelCreationAttributes<Projects>,
  ) {
    return super.create(body)
  }

//   @Role([RoleEnum.ADMIN,RoleEnum.PRODUCT_OWNER])
  @Get('/')
  public async findAll(
    @Query() query: EntityAttributes<Projects>
  ) {
    // return query ? super.findAll(query): this.userProjectService.rawQuery()
    return this.userProjectService.findAll(query)
  }
}
