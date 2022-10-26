import { Module } from '@nestjs/common';
import { DicomService } from './dicom.service';
import { DicomController } from './dicom.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Research } from '../research/entities/research.entity';
import { Dicom } from './entities/dicom.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dicom])],
  controllers: [DicomController],
  providers: [DicomService],
})
export class DicomModule {}
