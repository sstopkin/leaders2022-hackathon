import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDicomDto {
  @ApiProperty({ description: 'DICOM file name', example: 'DICOM file' })
  @IsNotEmpty()
  @IsString()
  public name: string;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Some DICOM file description',
  })
  @IsOptional()
  @IsString()
  public description?: string;

  @ApiProperty({
    description: 'Research ID (UUID)',
    example: 'bf572c89-9105-431c-bd81-0c4053b50e8a',
  })
  @IsNotEmpty()
  @IsUUID()
  public researchId: string;
}
