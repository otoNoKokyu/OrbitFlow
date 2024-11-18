import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, ValidateIf, IsNotEmpty, IsNumber } from 'class-validator';
import { RoleEnum } from 'src/modules/role/utility/roles.enum';

export class UserDTO {
  user_id: string;

  @IsString()
  username: string;

  @IsString()
  password_hash: string;

  @IsEmail()
  email: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  date_of_birth: string;

  @IsOptional()
  @IsEnum(['Male', 'Female', 'Other'])
  gender?: 'Male' | 'Female' | 'Other';

  @IsOptional()
  @IsEnum(RoleEnum)
  assigned_role: RoleEnum

  @IsString()
  phone_number?: string;

  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  zip_code?: string;

  @IsOptional()
  @IsString()
  profile_picture_url?: string;
  
  @IsBoolean()
  isInvited: boolean;

  @ValidateIf(o => o.isInvited === true)
  @IsNotEmpty()
  projectId: string;

}
