import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerConfigInit } from './config/swagger.config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './interceptors/error.interceptor';
import { ErrorService } from './modules/error/error.service';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // سواگر
  SwaggerConfigInit(app);

  // تنظیم پیشوند ثابت 'api'
  app.setGlobalPrefix('api');

  // global validation
  app.useGlobalPipes(new ValidationPipe());

  // فعال کردن نسخه‌بندی به صورت مسیر
  app.enableVersioning({
    type: VersioningType.URI, 
  });


  const errorService = app.get(ErrorService);
  app.useGlobalFilters(new AllExceptionsFilter(errorService));

  

  //  قعال شدن کورس
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],     
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,  
  });


  // اگر از ماژول کانفیگ استفاده کنیم اینجوری هم میشه
  // const configService = app.get(ConfigService);
  // const port = configService.get('App.port');

  const {PORT} = process.env;
  await app.listen(PORT , ()=>{
    console.log(`app running on port : ${PORT}`);
    console.log(`api document: http://localhost:${PORT}/api-docs`)
  });
}


bootstrap();
