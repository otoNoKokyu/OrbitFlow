import { Module } from '@nestjs/common';
import { MailService } from './mail/mail.service';

@Module({
  imports : [MailService],
  providers: [MailService],
  exports:[MailService]
})
export class AuthModule {}
