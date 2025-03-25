import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UsePipes,
  Query,
  Req,
  Put,
} from '@nestjs/common';
import { IssuesService } from './issues.service';
import { CreateIssueSchema,updateIssueSchema, fetchAllIssueSchema } from './validator/issues.validator'
import { JoiValidationPipe } from 'src/common/pipes/schema.validation.pipe';
import {  EntityAttributes, ModelCreationAttributes } from 'src/common/interface/IBase';
import { Issue } from './model/issue.model';
import { TAppUser } from 'src/utility/utility.type';
import { TUpdateIssue } from './types/types.issues';

@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) { }

  @Post('/')
  @UsePipes(new JoiValidationPipe(CreateIssueSchema))
  async create(@Body() body: ModelCreationAttributes<Issue>) {
    return await this.issuesService.create(body)
  }

  @Get('/')
  @UsePipes(new JoiValidationPipe(fetchAllIssueSchema))
  findAll(
    @Query() query?: EntityAttributes<Issue> & { page: number, limit: number },
    @Req() req?: { user?: TAppUser }
  ) {
    const { page = 1, limit = 10, ...filters } = query || {};
    return this.issuesService.findAll(filters,page,limit);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
      return await this.issuesService.findOne({id});
  }

  @Put(':id')
  @UsePipes(new JoiValidationPipe(updateIssueSchema))
  update(
    @Param('id') id: string,
    @Body() updateIssue: TUpdateIssue,
  ) {
    return this.issuesService.update({id}, updateIssue);
  }

  // @Delete(':id')
  // remove(@Param('id', ParseUUIDPipe) id: string) {
  //   return this.issuesService.remove(id);
  // }
}
