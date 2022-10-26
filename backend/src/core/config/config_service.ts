import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const API_DEFAULT_PREFIX = '/api/v1/';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get ENV(): string {
    return this.configService.get('ENV');
  }

  get APP_NAME(): string {
    return this.configService.get('APP_NAME');
  }

  get API_PORT(): number {
    return this.configService.get<number>('API_PORT');
  }

  get API_PREFIX(): string {
    return this.configService.get('API_PREFIX') || API_DEFAULT_PREFIX;
  }

  get API_EXTERNAL_URI(): string {
    return this.configService.get('API_EXTERNAL_URI');
  }

  get API_KEY(): string {
    return this.configService.get('API_KEY');
  }

  get JWT_ACCESS_TOKEN_SECRET(): string {
    return this.configService.get('JWT_ACCESS_TOKEN_SECRET');
  }

  get JWT_ACCESS_TOKEN_EXPIRATION(): string {
    return this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION');
  }

  get JWT_REFRESH_TOKEN_SECRET(): string {
    return this.configService.get('JWT_REFRESH_TOKEN_SECRET');
  }

  get JWT_REFRESH_TOKEN_EXPIRATION(): string {
    return this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION');
  }

  get POSTGRES_DB_NAME(): string {
    return this.configService.get('POSTGRES_DB_NAME');
  }

  get POSTGRES_DB_HOST(): string {
    return this.configService.get('POSTGRES_DB_HOST');
  }

  get POSTGRES_DB_PORT(): number {
    return this.configService.get<number>('POSTGRES_DB_PORT');
  }

  get POSTGRES_USER(): string {
    return this.configService.get('POSTGRES_USER');
  }

  get POSTGRES_PASSWORD(): string {
    return this.configService.get('POSTGRES_PASSWORD');
  }

  get TYPEORM_ENTITIES(): string {
    return this.configService.get('TYPEORM_ENTITIES');
  }

  get TYPEORM_SYNCHRONIZE(): boolean {
    return this.configService.get<boolean>('TYPEORM_SYNCHRONIZE');
  }

  get TYPEORM_MIGRATIONS_DIR(): string {
    return this.configService.get('TYPEORM_MIGRATIONS_DIR');
  }

  get TYPEORM_MIGRATIONS(): string {
    return this.configService.get('TYPEORM_MIGRATIONS');
  }

  get S3_URL(): string {
    return this.configService.get('S3_URL');
  }

  get S3_REGION(): string {
    return this.configService.get('S3_REGION');
  }

  get S3_ACCESS_KEY(): string {
    return this.configService.get('S3_ACCESS_KEY');
  }

  get S3_SECRET_KEY(): string {
    return this.configService.get('S3_SECRET_KEY');
  }

  get S3_BUCKET(): string {
    return this.configService.get('S3_BUCKET');
  }

  get S3_PRESIGNED_URL_ACCESS_INTERVAL(): number {
    return this.configService.get<number>('S3_PRESIGNED_URL_ACCESS_INTERVAL');
  }
}
