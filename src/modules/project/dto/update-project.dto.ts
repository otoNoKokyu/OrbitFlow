import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
