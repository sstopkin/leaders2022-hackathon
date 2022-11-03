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
import { DicomStatus } from '../entities/dicom.status';

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

  @ApiProperty({ description: 'DICOM file status', example: 'in_markup' })
  @IsNotEmpty()
  @IsEnum(DicomStatus)
  public status: DicomStatus;

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
