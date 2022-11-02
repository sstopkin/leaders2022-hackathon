import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import {
  GeneratingDiseasesCount,
  GeneratingDiseasesSize,
  GeneratingPathology,
  GeneratingSegment,
} from '../entities/research-generating-params.entity';

export class GenerateResearchDto {
  @ApiProperty({ description: 'Research name', example: 'Research' })
  @IsNotEmpty()
  public name: string;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Some research description',
  })
  @IsOptional()
  public description?: string;

  @ApiProperty({
    description: 'Parent research ID',
  })
  @IsNotEmpty()
  @IsUUID()
  public parentResearchId: string;

  @ApiProperty({
    isArray: true,
    enum: GeneratingSegment,
  })
  @IsNotEmpty()
  @IsEnum(GeneratingSegment, { each: true })
  readonly segments: GeneratingSegment[];

  @ApiProperty({ enum: GeneratingPathology })
  @IsNotEmpty()
  @IsEnum(GeneratingPathology)
  readonly pathology: GeneratingPathology;

  @ApiProperty({ enum: GeneratingDiseasesCount })
  @IsNotEmpty()
  @IsEnum(GeneratingDiseasesCount)
  readonly diseasesCount: GeneratingDiseasesCount;

  @ApiProperty({ enum: GeneratingDiseasesSize })
  @IsNotEmpty()
  @IsEnum(GeneratingDiseasesSize)
  readonly diseaseSize: GeneratingDiseasesSize;
}
