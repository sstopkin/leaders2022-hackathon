import { Test, TestingModule } from '@nestjs/testing';
import { DicomController } from './dicom.controller';
import { DicomService } from './dicom.service';

describe('DicomController', () => {
  let controller: DicomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DicomController],
      providers: [DicomService],
    }).compile();

    controller = module.get<DicomController>(DicomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
