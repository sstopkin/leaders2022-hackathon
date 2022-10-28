import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config({ path: `./ops-tools/environments/${process.env.ENV}/.env` });

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('POSTGRES_DB_HOST'),
  port: configService.get('POSTGRES_DB_PORT'),
  database: configService.get('POSTGRES_DB_NAME'),
  username: configService.get('POSTGRES_USER'),
  password: configService.get('POSTGRES_PASSWORD'),
  migrations: [configService.get('TYPEORM_MIGRATIONS')],
  entities: ['./src/modules/**/*.entity.ts'],
});
