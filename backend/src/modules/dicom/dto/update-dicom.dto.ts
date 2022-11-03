import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { DicomStatus } from '../entities/dicom.status';

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

  @ApiPropertyOptional({
    description: 'DICOM file status',
    example: 'in_markup',
  })
  @IsOptional()
  @IsEnum(DicomStatus)
  public status?: DicomStatus;
}
