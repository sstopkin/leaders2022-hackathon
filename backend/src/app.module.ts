import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService, validationSchema } from './core/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user';
import { ResearchModule } from './modules/research/research.module';
import { DicomModule } from './modules/dicom/dicom.module';
import * as _ from 'lodash';
import * as process from 'process';
import { S3Module } from 'nestjs-s3';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: validationSchema,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      database: process.env.POSTGRES_DB_NAME,
      host: process.env.POSTGRES_DB_HOST,
      port: _.toNumber(process.env.POSTGRES_DB_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
      autoLoadEntities: true,
    }),
    S3Module.forRootAsync({
      useFactory: () => ({
        config: {
          credentials: {
            accessKeyId: `${process.env.S3_ACCESS_KEY}`,
            secretAccessKey: `${process.env.S3_SECRET_KEY}`,
          },
          endpoint: `${process.env.S3_URL}`,
          s3ForcePathStyle: true,
          signatureVersion: 'v4',
          // region: `${process.env.S3_REGION}`,
        },
      }),
    }),
    AuthModule,
    UserModule,
    ResearchModule,
    DicomModule,
  ],
  controllers: [],
  providers: [AppConfigService],
})
export class AppModule {}
