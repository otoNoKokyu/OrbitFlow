import { IsNotEmpty, IsEnum } from 'class-validator';
import { RoleEnum } from '../utility/roles.enum';

export class CreateRoleDto {

    @IsEnum(RoleEnum)
    @IsNotEmpty()
    role: RoleEnum;

}
