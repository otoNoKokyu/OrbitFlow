import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModule } from './user/user.module';
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
        models: [],
        synchronize: true,
        pool:{
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }),
    }), UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
