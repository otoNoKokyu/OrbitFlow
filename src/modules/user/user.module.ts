import { forwardRef, Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './model/User.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserController } from './user.controller';
import { RoleModule } from 'src/modules/role/role.module';
import { UserService } from './user.service';
import { MailService } from 'src/utility/mail/mail.service';
import { JwtService } from 'src/utility/jwt/jwt.service';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    RoleModule,
    ProjectModule
  ],
  providers: [UserRepository,UserService,MailService,JwtService],
  exports: [UserService],
  controllers: [UserController]
})
export class UserModule {}
