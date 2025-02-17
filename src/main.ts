import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SwaggerTheme } from 'swagger-themes';
import { the } from '../node_modules/fb-watchman/index';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Invoice API')
    .setDescription('API for managing sales invoices')
    .setVersion('1.0')
    .addTag('invoices')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  const theme = new SwaggerTheme('v3');
  const options = {
    explorer: true
  };
  SwaggerModule.setup('api-docs', app, document, options);

  await app.listen(3000);
}
bootstrap();