import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class MarkupPoint {
  @ApiProperty()
  @IsNotEmpty()
  readonly x: number;

  @ApiProperty()
  @IsNotEmpty()
  readonly y: number;
}

export class MarkupImage {
  @ApiProperty()
  @IsNotEmpty()
  readonly imageId: string;

  @ApiProperty({ isArray: true, type: MarkupPoint })
  @IsNotEmpty()
  @Type(() => MarkupPoint)
  readonly polygon: MarkupPoint[];
}

export class DicomMarkup {
  @ApiProperty({ isArray: true, type: MarkupImage })
  @IsNotEmpty()
  @Type(() => MarkupImage)
  readonly images: MarkupImage[];
}