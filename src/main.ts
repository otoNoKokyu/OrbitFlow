import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Interceptor } from './interceptors/global.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()

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
