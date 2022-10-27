import { QueryFailedError } from 'typeorm';
import { DatabaseError } from 'pg-protocol';

export const isQueryFailedError = (
  err: unknown,
): err is QueryFailedError & DatabaseError => err instanceof QueryFailedError;

export enum PostgresErrorCode {
  UniqueViolation = '23505',
  CheckViolation = '23514',
  NotNullViolation = '23502',
  ForeignKeyViolation = '23503',
}
