import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DicomService } from './dicom.service';
import { CreateDicomDto } from './dto/create-dicom.dto';
import { UpdateDicomDto } from './dto/update-dicom.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('dicom')
@ApiTags('Dicom')
export class DicomController {
  constructor(private readonly dicomService: DicomService) {}

  @Post()
  create(@Body() createDicomDto: CreateDicomDto) {
    return this.dicomService.create(createDicomDto);
  }

  @Get()
  findAll() {
    return this.dicomService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dicomService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDicomDto: UpdateDicomDto) {
    return this.dicomService.update(+id, updateDicomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dicomService.remove(+id);
  }
}
