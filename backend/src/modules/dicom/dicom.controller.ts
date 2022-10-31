import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { DicomService } from './dicom.service';
import { CreateDicomDto } from './dto/create-dicom.dto';
import { UpdateDicomDto } from './dto/update-dicom.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import RoleGuard from '../auth/guards/role.guard';
import { UserRole } from '../user/entities/user.role';
import { ApiPaginatedResponse } from '../../core/api_docs/api_paginated_response';
import { Research } from '../research/entities/research.entity';
import { FindAllDicomDto } from './dto/find-all-dicom.dto';

@Controller('dicoms')
@ApiTags('Dicoms')
@ApiBearerAuth()
export class DicomController {
  constructor(private readonly dicomService: DicomService) {}

  @Get()
  @ApiPaginatedResponse(Research)
  @UseGuards(RoleGuard([UserRole.ADMIN, UserRole.USER], true))
  findAll(@Query() options: FindAllDicomDto) {
    return this.dicomService.findAll(options);
  }

  @Get('redirect')
  @Redirect('', HttpStatus.FOUND)
  async redirectToPublicUrl(@Query('path') path: string) {
    const redirectUrl = await this.dicomService.makeRedirectPublicUrl(path);
    return { url: redirectUrl };
  }

  @Get(':id')
  @UseGuards(RoleGuard([UserRole.ADMIN, UserRole.USER]))
  findOne(@Param('id') id: string) {
    return this.dicomService.findOne(id);
  }

  @Post()
  @UseGuards(RoleGuard([UserRole.ADMIN, UserRole.USER], true))
  create(@Body() createDicomDto: CreateDicomDto) {
    return this.dicomService.createOrUpdate(createDicomDto);
  }

  @Patch(':id')
  @UseGuards(RoleGuard([UserRole.ADMIN, UserRole.USER], true))
  update(@Param('id') id: string, @Body() updateDicomDto: UpdateDicomDto) {
    return this.dicomService.update(id, updateDicomDto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard([UserRole.ADMIN, UserRole.USER]))
  remove(@Param('id') id: string) {
    return this.dicomService.softDelete(id);
  }
}
