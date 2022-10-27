import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DicomMarkup } from '../entities/dicom-markup';

export class UpdateDicomDto {
  @ApiPropertyOptional({
    description: 'Description',
    example: 'Some DICOM file description',
  })
  @IsOptional()
  @IsString()
  public description?: string;

  @ApiPropertyOptional({ description: 'If DICOM file is uploaded' })
  @IsOptional()
  @IsBoolean()
  public isUploaded?: boolean;

  @ApiPropertyOptional({ description: 'DICOM file markup' })
  @IsOptional()
  @ValidateNested({ each: true })
  public markup?: DicomMarkup;
}
