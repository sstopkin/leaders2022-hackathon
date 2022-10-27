import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { DicomType } from '../entities/dicom.type';
import { DicomMarkup } from '../entities/dicom-markup';

export class GetDicomDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  public id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  public description: string;

  @ApiProperty({ description: 'DICOM file type', example: 'original' })
  @IsNotEmpty()
  @IsEnum(DicomType)
  public dicomType: DicomType;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  public isUploaded: boolean;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  public researchId: string;

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  public uploadingUrl?: string;

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  public downloadingUrl?: string;

  @ApiProperty()
  @IsOptional()
  public markup?: DicomMarkup;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  public createdAt: Date;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  public updatedAt: Date;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  public deletedAt?: Date;
}
