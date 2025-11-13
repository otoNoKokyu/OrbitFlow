import { Controller, Get, UsePipes, Req } from '@nestjs/common';
import { RoleService } from './role.service';
import { BaseController } from 'src/common/controller.base';
import { Roles } from './model/roles.model';
import { TAppUser } from 'src/utility/utility.type';
import { Role } from 'src/decorators/role.decorator';
import { RoleEnum } from './utility/roles.enum';

@Controller('role')
export class RoleController extends BaseController<Roles> {
  constructor(private readonly roleService: RoleService) {
    super(roleService)
  }
  @Get('/')
  @Role([RoleEnum.MANAGER,RoleEnum.LEAD,RoleEnum.ADMIN,RoleEnum.PLATFORM_ADMIN])
  public async getProjectsByFilter(
    @Req() { user }: { user: TAppUser }
  ) {
    const {role} = user;
    return await this.roleService.findRoleForAppropriateHierarchy(role)
  }
}
