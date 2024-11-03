import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/modules/user/user.module';
import { RoleModule } from 'src/modules/role/role.module';
import { ProjectModule } from 'src/modules/project/project.module';
import { MailService } from 'src/utility/mail/mail.service';
@Module({
  imports : [UserModule,RoleModule,ProjectModule],
  providers: [AuthService,MailService],
  controllers: [AuthController]
})
export class AuthModule {}
