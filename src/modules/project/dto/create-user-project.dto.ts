import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class UserProjectDTO {
    @IsNotEmpty()
    @IsUUID()
    projectId: string;

    @IsNotEmpty()
    @IsUUID()
    userId: string;

    @IsNotEmpty()
    @IsUUID()
    roleId: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
