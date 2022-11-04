import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';

export enum GeneratingSegment {
  RIGHT_DOWN = 'rightDown',
  RIGHT_MIDDLE = 'rightMiddle',
  RIGHT_UP = 'rightUp',
  LEFT_DOWN = 'leftDown',
  LEFT_UP = 'leftUp',
}

export enum GeneratingPathology {
  COVID19 = 'covid19',
  CANCER = 'cancer',
  METASTASIS = 'metastasis',
}

export enum GeneratingDiseasesCount {
  SINGLE = 'single',
  SMALL = 'small',
  HIGH = 'high',
}

export enum GeneratingDiseasesSize {
  EXTRA_SMALL = 'extraSmall',
  SMALL = 'small',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class ResearchGeneratingParams {
  @ApiProperty({
    isArray: true,
    enum: GeneratingSegment,
  })
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

  @ApiProperty({ description: 'Should auto markup be made' })
  @IsNotEmpty()
  @IsBoolean()
  readonly autoMarkup: boolean;
}
