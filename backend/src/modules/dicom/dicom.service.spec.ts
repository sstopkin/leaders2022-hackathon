import { Test, TestingModule } from '@nestjs/testing';
import { DicomService } from './dicom.service';

describe('DicomService', () => {
  let service: DicomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DicomService],
    }).compile();

    service = module.get<DicomService>(DicomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
