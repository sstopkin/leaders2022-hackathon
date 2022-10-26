import { Injectable } from '@nestjs/common';
import { CreateResearchDto } from './dto/create-research.dto';
import { UpdateResearchDto } from './dto/update-research.dto';

@Injectable()
export class ResearchService {
  create(createResearchDto: CreateResearchDto) {
    return 'This action adds a new research';
  }

  findAll() {
    return `This action returns all research`;
  }

  findOne(id: number) {
    return `This action returns a #${id} research`;
  }

  update(id: number, updateResearchDto: UpdateResearchDto) {
    return `This action updates a #${id} research`;
  }

  remove(id: number) {
    return `This action removes a #${id} research`;
  }
}
