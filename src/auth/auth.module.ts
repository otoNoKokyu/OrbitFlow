import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports : [UserModule,RoleModule],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
