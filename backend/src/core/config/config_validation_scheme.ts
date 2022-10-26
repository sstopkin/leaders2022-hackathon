import * as Joi from 'joi';

export const validationSchema = Joi.object({
  ENV: Joi.string().required(),

  APP_NAME: Joi.string().required(),
  API_PORT: Joi.number().required(),
  API_PREFIX: Joi.string(),
  API_EXTERNAL_URI: Joi.string().required(),

  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRATION: Joi.string().required(),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_EXPIRATION: Joi.string().required(),

  POSTGRES_DB_NAME: Joi.string().required(),
  POSTGRES_DB_HOST: Joi.string().required(),
  POSTGRES_DB_PORT: Joi.number().required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),

  TYPEORM_ENTITIES: Joi.string().required(),
  TYPEORM_SYNCHRONIZE: Joi.boolean().required(),
  TYPEORM_MIGRATIONS_DIR: Joi.string().required(),
  TYPEORM_MIGRATIONS: Joi.string().required(),
});
