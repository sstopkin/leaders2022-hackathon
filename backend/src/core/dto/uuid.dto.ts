import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class UuidDto {
  @ApiProperty()
  @IsUUID('all')
  @IsNotEmpty()
  public id: string;
}

export class OptionalProjectUuidDto {
  @ApiProperty()
  @IsUUID('all')
  @IsOptional()
  public projectId: string;
}
