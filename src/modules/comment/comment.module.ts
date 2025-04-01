import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { CommentRepository } from './comment.repository';
import { CommentMentionRepository } from './comment_mentions.repository';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { NotificationService } from '../notification/notification.service';
import { UserRepository } from '../user/user.repository';
import { MailService } from 'src/utility/mail/mail.service';

@Module({
  imports:[NotificationModule,UserModule],
  providers: [CommentService,CommentRepository,CommentMentionRepository,NotificationService,UserRepository,MailService],
  controllers: [CommentController]
})
export class CommentModule {}
