import { Body, Controller, Get, Param, Post, Put, Query, Req, UsePipes } from '@nestjs/common';
import { CommentService } from './comment.service';
import { BaseController } from 'src/common/controller.base';
import { Comment } from './model/comment.model';
import { AtLeastOneAttribute, EntityAttributes, ModelCreationAttributes } from 'src/common/interface/IBase';
import { JoiValidationPipe } from 'src/common/pipes/schema.validation.pipe';
import { CommentSchema, fetchCommentSchema, updateCommentSchema } from './validator/comment.validator';
import { TAppUser } from 'src/utility/utility.type';

@Controller('comment')
export class CommentController extends BaseController<Comment> {
    constructor(private readonly commentService: CommentService) {
        super(commentService)
    }
    @Post('/')
    @UsePipes(new JoiValidationPipe(CommentSchema))
    public async create(
      @Body() body: {body: ModelCreationAttributes<Comment>},
      @Req() req?: { user: TAppUser;  },

    ) {
    const {user} = req
      return await this.commentService.createOrUpdateComment({ 
        ...body, 
        author_id: user?.userId,
      },undefined,'create');
    }
    @Get('/')
    @UsePipes(new JoiValidationPipe(fetchCommentSchema))
    public async findAll(
        @Query() query?: EntityAttributes<Comment>,
    ) {
        return await this.commentService.findAll(query);
    }

    @Put('/:issueId/:id')
    // @UsePipes(new JoiValidationPipe(updateCommentSchema))
    public async updateComment(
      @Param('id') id:string,
      @Param('issueId') issue_id:string,
      @Body() body:AtLeastOneAttribute<Comment>
    ){
      return await this.commentService.createOrUpdateComment(body,{id,issue_id},'update')
    }
}
