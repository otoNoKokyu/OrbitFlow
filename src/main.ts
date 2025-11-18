import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Interceptor } from './interceptors/global.interceptor';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors()
  app.setBaseViewsDir(join(__dirname, '..', 'src/assets/email')); 
  app.setViewEngine('hbs'); 

  // const sequelize = app.get(Sequelize);
  // await sequelize.sync({ alter: true }); // run ONCE
  app.useGlobalPipes(new ValidationPipe(
    {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }
  ));

  app.useGlobalInterceptors(new Interceptor());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
