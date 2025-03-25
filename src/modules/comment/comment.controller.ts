import { Body, Controller, Get, Post, Put, Query, Req, UsePipes } from '@nestjs/common';
import { CommentService } from './comment.service';
import { BaseController } from 'src/common/controller.base';
import { Comment } from './model/comment.model';
import { Optional, InferCreationAttributes, InferAttributes } from 'sequelize';
import { NullishPropertiesOf } from 'sequelize/types/utils';
import { EntityAttributes, ModelCreationAttributes } from 'src/common/interface/IBase';
import { JoiValidationPipe } from 'src/common/pipes/schema.validation.pipe';
import { CommentSchema, fetchCommentSchema } from './validator/comment.validator';
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
      return await this.commentService.create({ 
        ...body, 
        author_id: user?.userId 
      });
    }
    @Get('/')
    @UsePipes(new JoiValidationPipe(fetchCommentSchema))
    findAll(
        @Query() query?: EntityAttributes<Comment>,
    ) {
        return this.commentService.findAll(query);
    }

    @Put('/')
    @UsePipes()


}
