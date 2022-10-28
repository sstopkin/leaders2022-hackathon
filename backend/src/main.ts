import { INestApplication, LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import helmet from 'helmet';
import { AppConfigService } from './core/config';
import * as process from 'process';

const SWAGGER_TITLE = 'Hackathon-Leaders 2022';
const SWAGGER_DESCRIPTION = 'API';
const SWAGGER_PREFIX = '/docs';

const DEV_LOG_LEVELS: LogLevel[] = ['debug', 'verbose', 'log', 'warn', 'error'];
const PROD_LOG_LEVELS: LogLevel[] = ['log', 'warn', 'error'];

function createSwagger(app: INestApplication) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const version = require('../package.json').version || '';

  const options = new DocumentBuilder()
    .setTitle(SWAGGER_TITLE)
    .setDescription(SWAGGER_DESCRIPTION)
    .setVersion(version)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(
    `${process.env.API_PREFIX}${SWAGGER_PREFIX}`,
    app,
    document,
    {
      swaggerOptions: {
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    },
  );
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: process.env.ENV === 'local',
    logger:
      process.env.ENV === 'staging' || process.env.ENV === 'production'
        ? PROD_LOG_LEVELS
        : DEV_LOG_LEVELS,
  });
  const config = app.get(AppConfigService);
  app.setGlobalPrefix(config.API_PREFIX);

  if (!process.env.SWAGGER_ENABLE || process.env.SWAGGER_ENABLE === '1') {
    createSwagger(app);
  }

  app.use(json({ limit: '500mb' }));
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(config.API_PORT);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
