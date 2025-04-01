import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Seguridad
  app.use(helmet());
  app.use(compression());
  app.enableCors();
  
  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Configuración Swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('API desarrollada con NestJS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Puerto
  const port = configService.get<number>('port') || 3000;
  await app.listen(port);
  console.log(`La aplicación está ejecutándose en: ${await app.getUrl()}`);
}
bootstrap();
