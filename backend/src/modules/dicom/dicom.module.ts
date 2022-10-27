import { Module } from '@nestjs/common';
import { DicomService } from './dicom.service';
import { DicomController } from './dicom.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dicom } from './entities/dicom.entity';
import { CloudService } from '../cloud/cloud.service';
import { CloudModule } from '../cloud/cloud.module';
import { AppConfigService } from '../../core/config';
import { ResearchService } from '../research/research.service';
import { Research } from '../research/entities/research.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dicom, Research]), CloudModule],
  controllers: [DicomController],
  providers: [DicomService, CloudService, AppConfigService, ResearchService],
})
export class DicomModule {}
