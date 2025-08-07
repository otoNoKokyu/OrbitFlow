import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    ParseUUIDPipe,
    UsePipes,
  } from '@nestjs/common';
  import { IssuesService } from './issues.service';
  import {CreateIssueDto} from './validator/issues.validator'
import { JoiValidationPipe } from 'src/common/pipes/schema.validation.pipe';
import { ModelCreationAttributes } from 'src/common/interface/IBase';
import { Issue } from './model/issue.model';
  
  @Controller('issues')
  export class IssuesController {
    constructor(private readonly issuesService: IssuesService) {}
  
    @Post()
    @UsePipes(new JoiValidationPipe(CreateIssueDto))
    create(@Body() createIssueDto:  ModelCreationAttributes<Issue>) {
    }
  
    @Get()
    findAll() {
    //   return this.issuesService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
    //   return this.issuesService.findOne(id);
    }
  
    // @Put(':id')
    // update(
    //   @Param('id', ParseUUIDPipe) id: string,
    //   @Body() updateIssueDto: UpdateIssueDto,
    // ) {
    //   return this.issuesService.update(id, updateIssueDto);
    // }
  
    // @Delete(':id')
    // remove(@Param('id', ParseUUIDPipe) id: string) {
    //   return this.issuesService.remove(id);
    // }
  }
  