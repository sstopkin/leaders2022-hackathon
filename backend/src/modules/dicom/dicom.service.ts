import { Injectable } from '@nestjs/common';
import { CreateDicomDto } from './dto/create-dicom.dto';
import { UpdateDicomDto } from './dto/update-dicom.dto';

@Injectable()
export class DicomService {
  create(createDicomDto: CreateDicomDto) {
    return 'This action adds a new dicom';
  }

  findAll() {
    return `This action returns all dicom`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dicom`;
  }

  update(id: number, updateDicomDto: UpdateDicomDto) {
    return `This action updates a #${id} dicom`;
  }

  remove(id: number) {
    return `This action removes a #${id} dicom`;
  }
}
