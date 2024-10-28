import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { User } from './user/model/User.model';
import { authMiddleware } from './middlewares/auth/auth.middleware';
@Module({
  imports: [
    ConfigModule.forRoot(), // Load .env file
    SequelizeModule.forRootAsync({
      useFactory: async () => ({
        dialect: 'mysql',
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        models: [User],
        synchronize: true,
        pool:{
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        },autoLoadModels:true,
      }),
    }), 
    UserModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(authMiddleware)
      .exclude({
        path: 'auth', method: RequestMethod.ALL
      })
      .forRoutes('*')

  }
}
