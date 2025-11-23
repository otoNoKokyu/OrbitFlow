import { Controller, Get, Body,   Query, Req, UsePipes, BadRequestException } from '@nestjs/common';
import { fetchAllUserProjectSchema, userProjectSchema } from './dto/userProject.dto';
import { RoleEnum } from '../role/utility/roles.enum';
import { Role } from 'src/decorators/role.decorator';
import { UserProjectService } from './userProject.service';
import { EntityAttributes, ModelCreationAttributes } from 'src/common/interface/IBase';
import { UserProject } from './entities/userprojects.model';
import { BaseController } from 'src/common/controller.base';
import { JoiValidationPipe } from 'src/common/pipes/schema.validation.pipe';
import { TAppUser } from 'src/utility/utility.type';


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
    @Query() query?: EntityAttributes<UserProject>,
    @Req() req?: { user?: TAppUser }
  ){
    if (!req?.user?.userId) throw new BadRequestException('No user found in request');
    const { userId, roleId } = req.user;
    return this.userProjectService.findAll({
      ...query,
      userId: query?.userId || userId,
      roleId: roleId,
    });
  }
    @Get('/users')
  @UsePipes(new JoiValidationPipe(fetchAllUserProjectSchema))
  public async findUsersInProject(
    @Query() query?: EntityAttributes<UserProject>
  ){
    return this.userProjectService.findAll({
      ...query,
    });
  }
  
  
}
