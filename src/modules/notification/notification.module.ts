import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MailService } from 'src/utility/mail/mail.service';

@Module({
  
  providers: [ MailService, NotificationService]
})
export class NotificationModule {}
