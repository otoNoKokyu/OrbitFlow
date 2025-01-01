export class CreateProjectDto {}
import { IsBoolean, IsDate, IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class ProjectsDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  start_date: string;

  @IsString()
  @IsOptional()
  end_date?: string;

  @IsInt()
  @IsOptional()
  min_issue_count?: number;

  @IsString()
  @IsOptional()
  owned_by?: string;

  @IsString()
  @IsOptional()
  lead_by?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsString()
  @IsOptional()
  created_at?: string;

  @IsString()
  @IsOptional()
  updated_at?: string;
}
