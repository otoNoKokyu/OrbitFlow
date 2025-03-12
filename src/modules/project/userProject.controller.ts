import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProjectService } from './project.service';
// import { CreateProjectDto, ProjectsDto } from './dto/project.dto';
import { fetchAllUserProjectSchema, userProjectSchema } from './dto/userProject.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { RoleEnum } from '../role/utility/roles.enum';
import { Role } from 'src/decorators/role.decorator';
import { Projects } from './entities/project.model';
import { UserProjectService } from './userProject.service';
import { EntityAttributes, ModelCreationAttributes } from 'src/common/interface/IBase';
import { UserProject } from './entities/userprojects.model';
import { BaseController } from 'src/common/controller.base';
import { JoiValidationPipe } from 'src/common/pipes/schema.validation.pipe';

@Controller('userproject')
export class UserProjectController extends BaseController<UserProject> {
  constructor(private readonly userProjectService: UserProjectService) {super(userProjectService)
}

  @Role([RoleEnum.ADMIN])
  @UsePipes(new JoiValidationPipe(userProjectSchema))
  
  public async create(
    @Body() body: ModelCreationAttributes<UserProject>,
  ) {
    return super.create(body)
  }

//   @Role([RoleEnum.ADMIN,RoleEnum.PRODUCT_OWNER])
  @Get('/')
  @UsePipes(new JoiValidationPipe(fetchAllUserProjectSchema))
  public async findAll(
    @Query() query: EntityAttributes<UserProject>,
    @Req () {user}: any
  ) {
    return this.userProjectService.findAll({...query,userId:query.userId || user.userId, roleId: user.roleId})
  }
}
