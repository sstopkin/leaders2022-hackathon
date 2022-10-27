import { Module } from '@nestjs/common';
import { CloudService } from './cloud.service';
import { AppConfigService } from '../../core/config';

@Module({
  imports: [],
  exports: [CloudService],
  providers: [CloudService, AppConfigService],
})
export class CloudModule {}
