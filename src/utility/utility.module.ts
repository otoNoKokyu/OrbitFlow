import { Module } from '@nestjs/common';
import { MailService } from './mail/mail.service';
import { RedisService } from './redis/redis.service';
import { JwtService } from './jwt/jwt.service';
import { UserSecurityModule } from './user-security/user-security.module';
import { UserSecurityService } from './user-security/user-security.service';

@Module({
  imports : [MailService, RedisService, UserSecurityModule],
  providers: [MailService, RedisService, JwtService],
  exports:[MailService,RedisService, UserSecurityService]
})
export class UtilityModule {}
