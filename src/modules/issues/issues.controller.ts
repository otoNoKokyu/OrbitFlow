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
import { TUpdateIssue } from './types/types.issues';
import { BaseController } from 'src/common/controller.base';

@Controller('issues')
export class IssuesController extends BaseController<Issue> {
  constructor(private readonly issuesService: IssuesService) {super(issuesService)}

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
    const result =  await this.issuesService.findAll(filters,page,limit);
    return {
      ...result,
      data: result.data.map((e) => {
        const json = e.toJSON();
        return {
          ...json,
          assignee: json.assignee?.username ?? null,
          createdAt: new Date(json.createdAt).toLocaleDateString(),
          dueDate: new Date(json.dueDate).toLocaleDateString()
        };
      })
    
  }
}

  @Get('/getfilter')
  async getAllFilter(
    @Req() { user:{userId} }: { user: { userId: string; roleId: string } }
    
  ) {
    return await this.issuesService.getAllFilter(userId);
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
}
