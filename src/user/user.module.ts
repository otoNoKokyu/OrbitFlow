import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './model/User.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forFeature([User])
  ],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
