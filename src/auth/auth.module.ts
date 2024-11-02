import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { RoleModule } from 'src/role/role.module';
import { ProjectModule } from 'src/project/project.module';
@Module({
  imports : [UserModule,RoleModule,ProjectModule],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
