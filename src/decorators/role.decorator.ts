import { SetMetadata } from '@nestjs/common';
import { EligbleInviteRole, RoleEnum } from 'src/modules/role/utility/roles.enum';

export const Role = (role: RoleEnum | EligbleInviteRole) => SetMetadata('role', role);
