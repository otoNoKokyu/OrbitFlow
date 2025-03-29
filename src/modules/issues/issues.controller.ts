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
import { BaseController } from 'src/common/controller.base';

@Controller('issues')
export class IssuesController extends BaseController<Issue> {
  constructor(private readonly issuesService: IssuesService) {
    super(issuesService)
   }

  @Post('/')
  @UsePipes(new JoiValidationPipe(CreateIssueSchema))
  async create(@Body() body: ModelCreationAttributes<Issue>) {
    return await this.issuesService.create(body)
  }

  @Get('/')
  @UsePipes(new JoiValidationPipe(fetchAllIssueSchema))
  async findAll(
    @Query() query?: EntityAttributes<Issue> & { page: number, limit: number },
  ) {
    const { page = 1, limit = 10, ...filters } = query || {};
    return await this.issuesService.findAll(filters,page,limit);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
      return await super.findById(id);
  }

  @Put(':id')
  @UsePipes(new JoiValidationPipe(updateIssueSchema))
  async update(
    @Param('id') id: string,
    @Body() updateIssue: TUpdateIssue,
  ) {
    return await this.issuesService.update({id}, updateIssue);
  }

  // @Delete(':id')
  // remove(@Param('id', ParseUUIDPipe) id: string) {
  //   return this.issuesService.remove(id);
  // }
}
