import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Exception filter global
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Prefix global (excluir webhook de WhatsApp)
  app.setGlobalPrefix('api', {
    exclude: ['webhook/whatsapp'],
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Tinka API')
    .setDescription(
      'API para el sistema de registro de ventas para emprendedores de Tinka - Banco FIE',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa el token JWT para autenticación',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Autenticación de usuarios')
    .addTag('Businesses', 'Gestión de negocios')
    .addTag('Sales', 'Registro de ventas')
    .addTag('Reports', 'Reportes y estadísticas')
    .addTag('WhatsApp', 'Webhook de WhatsApp')
    .addTag('Coach', 'Asistente virtual Tinka')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Ruta pública para Swagger UI
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(
      `🚀 Servidor corriendo en http://localhost:${process.env.PORT ?? 3000}/api`,
    );
    console.log(
      `📚 Documentación Swagger: http://localhost:${process.env.PORT ?? 3000}/docs`,
    );
  });
}

void bootstrap();
