import 'reflect-metadata';
import * as crypto from 'crypto';

// Polyfill para crypto en contexto global (DEBE estar ANTES de cualquier otro import)
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = crypto.webcrypto;
}

// Añade randomUUID si no está disponible
if (typeof (globalThis.crypto as any).randomUUID !== 'function') {
  (globalThis.crypto as any).randomUUID = () => crypto.randomUUID();
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import {
  JSON_BODY_LIMIT,
  buildHelmetOptions,
  isSwaggerEnabled,
  resolveCorsOrigins,
} from './config/http-security.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Detrás de nginx: confiar en el primer proxy para obtener la IP real
  // (rate limiting por IP, logs).
  app.set('trust proxy', 1);

  // Cabeceras de seguridad. CORP cross-origin para que el portal cargue imágenes.
  app.use(helmet(buildHelmetOptions()));

  // Cuerpos JSON/urlencoded hasta 1 MB. Las subidas de archivos usan multipart
  // (multer) y tienen sus propios límites por endpoint.
  app.useBodyParser('json', { limit: JSON_BODY_LIMIT });
  app.useBodyParser('urlencoded', { limit: JSON_BODY_LIMIT, extended: true });

  // CORS: CORS_ORIGINS (coma) o dominios de producción; localhost solo fuera de producción.
  app.enableCors({
    origin: resolveCorsOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Validación global. whitelist elimina propiedades no declaradas en los DTO
  // (evita mass assignment). forbidNonWhitelisted queda en false: no se pudo
  // verificar que portal/backoffice no envíen campos extra en todos los DTO,
  // y rechazar con 400 rompería formularios existentes.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Configuración de archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });

  // Swagger solo fuera de producción.
  if (isSwaggerEnabled()) {
    const config = new DocumentBuilder()
      .setTitle('Real Estate Platform API')
      .setDescription('API documentation for Real Estate Platform')
      .setVersion('1.0')
      .addTag('multimedia')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const port = process.env.PORT || 8000;
  await app.listen(port);
}
bootstrap();
