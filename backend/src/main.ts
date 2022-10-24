import { INestApplication, LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import { SqsModule, SqsQueueType } from '@nestjs-packages/sqs';
import helmet from 'helmet';

const API_DEFAULT_PORT = 3000;
const API_DEFAULT_PREFIX = '/api/v1/';

const SWAGGER_TITLE = 'Sinovoltaics admin panel';
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
  SwaggerModule.setup(SWAGGER_PREFIX, app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: process.env.ENV === 'local' ? true : false,
    logger:
      process.env.ENV === 'staging' || process.env.ENV === 'production'
        ? PROD_LOG_LEVELS
        : DEV_LOG_LEVELS,
  });

  app.setGlobalPrefix(process.env.API_PREFIX || API_DEFAULT_PREFIX);

  if (!process.env.SWAGGER_ENABLE || process.env.SWAGGER_ENABLE === '1') {
    createSwagger(app);
  }
  SqsModule.registerQueue({
    name: process.env.AWS_SQS_QUEUE_NAME,
    type: SqsQueueType.Producer,
  });

  app.use(json());
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

  await app.listen(process.env.API_PORT || API_DEFAULT_PORT);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
