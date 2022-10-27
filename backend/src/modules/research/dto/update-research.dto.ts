import { ApiProperty } from '@nestjs/swagger';
import { ResearchStatus } from '../entities/research.status';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateResearchDto {
  @ApiProperty({ description: 'Research name', example: 'Research' })
  @IsOptional()
  public name?: string;

  @ApiProperty({
    description: 'Description',
    example: 'Some research description',
  })
  @IsOptional()
  public description?: string;

  @ApiProperty({ description: 'Research status', example: 'created' })
  @IsOptional()
  @IsEnum(ResearchStatus)
  public status?: ResearchStatus;
}
