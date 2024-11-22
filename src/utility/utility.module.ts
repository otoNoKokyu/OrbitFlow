import { Module } from '@nestjs/common';
import { MailService } from './mail/mail.service';
import { RedisService } from './redis/redis.service';
import { JwtService } from './jwt/jwt.service';

@Module({
  imports : [MailService, RedisService],
  providers: [MailService, RedisService, JwtService],
  exports:[MailService,RedisService]
})
export class AuthModule {}
