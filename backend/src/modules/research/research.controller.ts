import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ResearchService } from './research.service';
import { CreateResearchDto } from './dto/create-research.dto';
import { UpdateResearchDto } from './dto/update-research.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('research')
@ApiTags('Research')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Post()
  create(@Body() createResearchDto: CreateResearchDto) {
    return this.researchService.create(createResearchDto);
  }

  @Get()
  findAll() {
    return this.researchService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.researchService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateResearchDto: UpdateResearchDto,
  ) {
    return this.researchService.update(+id, updateResearchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.researchService.remove(+id);
  }
}
