import { Module } from '@nestjs/common';
import { ResearchService } from './research.service';
import { ResearchController } from './research.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Research } from './entities/research.entity';
import { CloudService } from '../cloud/cloud.service';
import { AppConfigService } from '../../core/config';
import { Dicom } from '../dicom/entities/dicom.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Research])],
  controllers: [ResearchController],
  providers: [ResearchService, CloudService, AppConfigService],
})
export class ResearchModule {}
