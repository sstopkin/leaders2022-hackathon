import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateResearchDto } from './dto/create-research.dto';
import { UpdateResearchDto } from './dto/update-research.dto';
import { FindAllOptionsDto } from '../../core/dto/find_all/find_all_options.dto';
import { v4 as uuidv4 } from 'uuid';
import { PageDto } from '../../core/dto/find_all/page.dto';
import { Research } from './entities/research.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { makeFindAllQuryBuilder } from '../../core/db/query_builders/find_all';
import { CloudService } from '../cloud/cloud.service';
import { ResearchStatus } from './entities/research.status';

@Injectable()
export class ResearchService {
  private readonly availableStatusChanges: Array<string> = [
    `${ResearchStatus.CREATED}-${ResearchStatus.UPLOADING}`,
    `${ResearchStatus.UPLOADING}-${ResearchStatus.UPLOADED}`,
    `${ResearchStatus.UPLOADED}-${ResearchStatus.GENERATING}`,
    `${ResearchStatus.GENERATING}-${ResearchStatus.GENERATED}`,
  ];

  public constructor(
    @InjectRepository(Research)
    private readonly repository: Repository<Research>,
    private readonly cloudService: CloudService,
  ) {}

  async findAll(
    options: FindAllOptionsDto,
  ): Promise<Research[] | PageDto<Research>> {
    const queryBuilder = makeFindAllQuryBuilder(
      this.repository,
      Research,
      options,
    );

    try {
      if (!options.page || !options.limit) {
        return await queryBuilder.getMany();
      }
      const [data, total] = await queryBuilder.getManyAndCount();
      return new PageDto<Research>(
        data,
        data.length,
        total,
        options.page,
        options.limit,
      );
    } catch (e) {
      if (e instanceof QueryFailedError) {
        throw new BadRequestException(e.message);
      }
    }
  }

  async findOne(id: string): Promise<Research> {
    const research = await this.repository.findOne({
      where: { id: id },
      relations: ['dicoms'],
    });
    if (!research) {
      throw new BadRequestException('Research does not exist');
    }
    return research;
  }

  async create(dto: CreateResearchDto): Promise<void> {
    const researchId = uuidv4();
    await this.cloudService.putObject(`${researchId}/`);
    await this.repository.insert({
      ...dto,
      id: researchId,
      status: ResearchStatus.CREATED,
    });
  }

  async update(id: string, dto: UpdateResearchDto): Promise<Research> {
    const research = await this.findResearchOrThrowException(id);
    if (!!dto.name) {
      research.name = dto.name;
    }
    if (!!dto.description) {
      research.description = dto.description;
    }
    if (!!dto.status) {
      this.validateStatusChanging(research.status, dto.status);
      research.status = dto.status;
    }

    return this.repository.save(research);
  }

  async softDelete(id: string) {
    const research = await this.findResearchOrThrowException(id);
    await this.repository.softDelete(research.id);
  }

  async findResearchOrThrowException(id: string): Promise<Research> {
    const research = await this.repository.findOneBy({ id: id });
    if (!research) {
      throw new BadRequestException('Research does not exist');
    }
    return research;
  }

  validateStatusChanging(
    currentStatus: ResearchStatus,
    newStatus: ResearchStatus,
  ) {
    if (
      !this.availableStatusChanges.includes(`${currentStatus}-${newStatus}`)
    ) {
      throw new BadRequestException(
        `Not valid operation of changing status '${currentStatus}' on '${newStatus}'`,
      );
    }
  }
}
