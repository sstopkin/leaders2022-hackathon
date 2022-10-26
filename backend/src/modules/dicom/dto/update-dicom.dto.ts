import { PartialType } from '@nestjs/swagger';
import { CreateDicomDto } from './create-dicom.dto';

export class UpdateDicomDto extends PartialType(CreateDicomDto) {}
