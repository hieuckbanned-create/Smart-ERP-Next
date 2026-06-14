import 'reflect-metadata';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: ['error', 'warn', 'log'] });

  // CORS configuration - allow specific origins in production
  const configuredCorsOrigins = process.env.CORS_ORIGINS
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const corsOrigins = configuredCorsOrigins?.length ? configuredCorsOrigins : [
    'http://localhost:3457',
    'http://localhost:3467',
    'http://localhost:3456',
    'http://localhost:3001',
    'http://localhost:3000',
  ];
  app.enableCors({
    origin: corsOrigins,
    credentials: true
  });
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });
  app.useStaticAssets(uploadsDir, { prefix: '/uploads/' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Smart ERP Next API')
    .setDescription('API documentation for Smart ERP Next v0.4.0')
    .setVersion('0.4.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  
  // SRE: Kích hoạt Graceful Shutdown
  app.enableShutdownHooks();
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api`);
}
bootstrap();
