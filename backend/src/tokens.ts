/**
 * These tokens can be used for NestJS custom providers. For each required
 * custom provider, declare a new string below and use in the whole application.
 *
 * @see https://docs.nestjs.com/fundamentals/custom-providers
 */
export enum Service {
  STORAGE = 'storage.service',
  CONFIG = 'config.service',
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export const API_URL = `${process.env.APP_EXTERNAL_URI}${process.env.API_PREFIX}`;
export const FRONTEND_BASE_URL = `${process.env.FRONTEND_BASE_URL}`;
