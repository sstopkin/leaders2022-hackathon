import { Module } from '@nestjs/common';
import { DicomService } from './dicom.service';
import { DicomController } from './dicom.controller';

@Module({
  controllers: [DicomController],
  providers: [DicomService],
})
export class DicomModule {}
