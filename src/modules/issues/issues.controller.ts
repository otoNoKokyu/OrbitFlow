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
import { isEmptyObject } from 'src/utility/NullishUtills';

@Controller('issues')
export class IssuesController extends BaseController<Issue> {
  constructor(private readonly issuesService: IssuesService) {super(issuesService)}

  @Post('/')
  // @UsePipes(new JoiValidationPipe(CreateIssueSchema))
  async create(@Body() body: ModelCreationAttributes<Issue>, @Req() req: Request) {
    return await this.issuesService.create({...body,createdBy: req.user.userId})
  }
@Get('/')
@UsePipes(new JoiValidationPipe(fetchAllIssueSchema))
async findAll(
  @Query() query: EntityAttributes<Issue> & { page: number; limit: number; anyKey?:string },
  @Req() req: Request
) {
  const { page = 1, limit = 10,anyKey, ... filters  } = query || {};

  // if (isEmptyObject(filters)) filters.assigneeId = req.user.userId;
  if(anyKey) filters['anyKey'] = anyKey

  const result = await this.issuesService.findAll(filters, page, limit);

  return {
    ...result,
    data: result.data.map((e) => {
      const json = e.toJSON();
      return {
        ...json,
        assignee: `${json.assignee?.first_name} ${json.assignee?.last_name}`,
        createdAt: new Date(json.createdAt).toLocaleDateString(),
        dueDate: json.dueDate
          ? new Date(json.dueDate).toLocaleDateString()
          : null,
      };
    }),
  };
}


  @Get('/getfilter')
  async getAllFilter(
    @Req() { user:{userId} }: { user: { userId: string; roleId: string } }
    
  ) {
    return await this.issuesService.getAllFilter(userId);
  }

  @Get(':projIssueId')
  async findOne(@Param('projIssueId') projIssueId: string) {
      return await this.issuesService.findById(projIssueId);
  }

  @Put(':id')
  @UsePipes(new JoiValidationPipe(updateIssueSchema))
  async update(
    @Param('id') id: string,
    @Body() updateIssue: TUpdateIssue,
    @Query('attachment') attachment: boolean
  ) {
    if(attachment) return await this.issuesService.updateAttachments(id,updateIssue)
    return await this.issuesService.update({id}, updateIssue);
  }
}
