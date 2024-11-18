import { Module } from '@nestjs/common';
import { MailService } from './mail/mail.service';
import { RedisService } from './redis/redis.service';

@Module({
  imports : [MailService, RedisService],
  providers: [MailService, RedisService],
  exports:[MailService,RedisService]
})
export class AuthModule {}
