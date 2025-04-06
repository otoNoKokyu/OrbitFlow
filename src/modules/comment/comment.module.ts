import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { CommentRepository } from './comment.repository';
import { CommentMentionRepository } from './comment_mentions.repository';
import { UserModule } from '../user/user.module';
import { UserRepository } from '../user/user.repository';
import { MailService } from 'src/utility/mail/mail.service';
import { EventBusModule } from '../shared/event-bus.module';
import { IssueRepository } from '../issues/issue.repository';

@Module({
  imports:[UserModule,EventBusModule],
  providers: [CommentService,CommentRepository,CommentMentionRepository,UserRepository,MailService,IssueRepository],
  controllers: [CommentController]
})
export class CommentModule {}
