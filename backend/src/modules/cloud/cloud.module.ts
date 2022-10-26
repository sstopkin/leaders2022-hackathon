import { Module } from '@nestjs/common';
import { CloudService } from './cloud.service';
import { SqsModule, SqsService } from '@nestjs-packages/sqs';

@Module({
  imports: [SqsModule],
  exports: [CloudService, SqsService],
  providers: [CloudService, SqsService],
})
export class CloudModule {}
