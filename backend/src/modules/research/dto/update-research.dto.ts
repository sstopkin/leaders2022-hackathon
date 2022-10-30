import { ApiPropertyOptional } from '@nestjs/swagger';
import { ResearchStatus } from '../entities/research.status';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateResearchDto {
  @ApiPropertyOptional({ description: 'Research name', example: 'Research' })
  @IsOptional()
  public name?: string;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Some research description',
  })
  @IsOptional()
  public description?: string;

  @ApiPropertyOptional({ description: 'Research status', example: 'created' })
  @IsOptional()
  @IsEnum(ResearchStatus)
  public status?: ResearchStatus;
}
