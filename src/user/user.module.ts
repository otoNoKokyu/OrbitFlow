import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './model/User.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserController } from './user.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([User])
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController]
})
export class UserModule {}
