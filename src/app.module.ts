import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { User } from './modules/user/model/User.model';
import { AuthMiddleware } from './middlewares/auth/auth.middleware';
import { RoleModule } from './modules/role/role.module';
import { Roles } from './modules/role/model/roles.model';
import { MailerModule } from '@nestjs-modules/mailer';
import { ProjectModule } from './modules/project/project.module';
import { Projects } from './modules/project/entities/project.model';
import { APP_GUARD } from '@nestjs/core';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RolesGuard } from './guards/role.guard';
import { UserProject } from './modules/project/entities/userprojects.model';
import { HelperModule } from './helper/helper.module';
import { MiddlewareModule } from './middlewares/middleware.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRoot({
      transport: {
      host: 'smtp.gmail.com', 
      port: 465, 
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      },
    }),
    SequelizeModule.forRootAsync({
      useFactory: async () => ({
        dialect: 'mysql',
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        models: [User,Roles,Projects,UserProject],
        synchronize: true,
        pool:{
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        autoLoadModels:true,
      }),
    }), 
    RedisModule.forRootAsync({
      useFactory: async()=> ({
        type: 'single',
        url: 'redis://localhost:6379',
      })
    }),
    UserModule,
    MiddlewareModule,
    HelperModule,
    AuthModule,
    RoleModule,
    ProjectModule
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ],
})
export class AppModule {}
