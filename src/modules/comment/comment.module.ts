import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { CommentRepository } from './comment.repository';
import { CommentMentionRepository } from './comment_mentions.repository';

@Module({
  providers: [CommentService,CommentRepository,CommentMentionRepository],
  controllers: [CommentController]
})
export class CommentModule {}
