import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDicomDto } from './dto/create-dicom.dto';
import { UpdateDicomDto } from './dto/update-dicom.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Dicom } from './entities/dicom.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { CloudService, S3PresignedUrlOperation } from '../cloud/cloud.service';
import { PageDto } from '../../core/dto/find_all/page.dto';
import { makeFindAllQuryBuilder } from '../../core/db/query_builders/find_all';
import { GetDicomDto } from './dto/get-dicom.dto';
import { FindAllDicomDto } from './dto/find-all-dicom.dto';
import { ResearchService } from '../research/research.service';
import { DicomStatus } from './entities/dicom.status';

@Injectable()
export class DicomService {
  private readonly availableStatusChanges: Array<string> = [
    `${DicomStatus.NOT_MARKED}-${DicomStatus.IN_MARKUP}`,
    `${DicomStatus.IN_MARKUP}-${DicomStatus.MARKUP_DONE}`,
    `${DicomStatus.MARKUP_DONE}-${DicomStatus.IN_MARKUP}`,
  ];

  constructor(
    @InjectRepository(Dicom)
    private readonly dicomRepository: Repository<Dicom>,
    private readonly cloudService: CloudService,
    private readonly researchService: ResearchService,
  ) {}

  async findAll(
    options: FindAllDicomDto,
  ): Promise<GetDicomDto[] | PageDto<GetDicomDto>> {
    let dicomQueryBuilder = makeFindAllQuryBuilder(
      this.dicomRepository,
      Dicom,
      options,
    );

    if (!!options.researchId) {
      dicomQueryBuilder = dicomQueryBuilder.andWhere(
        'Dicom.researchId = :researchId',
        {
          researchId: options.researchId,
        },
      );
    }

    const resultMaker = (data) => {
      const promises = data.map((file) => this.makeGetDicomDto(file));
      return Promise.all(promises);
    };

    try {
      if (!options.page || !options.limit) {
        return await resultMaker(await dicomQueryBuilder.getMany());
      }
      const [data, total] = await dicomQueryBuilder.getManyAndCount();
      return new PageDto<GetDicomDto>(
        await resultMaker(data),
        data.length,
        total,
        options.page,
        options.limit,
      );
    } catch (e) {
      if (e instanceof QueryFailedError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  async findOne(id: string): Promise<Dicom> {
    return await this.findDicomOrThrowException(id);
  }

  async createOrUpdate(createDicomDto: CreateDicomDto): Promise<GetDicomDto> {
    const research = await this.researchService.findResearchOrThrowException(
      createDicomDto.researchId,
    );

    const existedDicom = await this.dicomRepository
      .createQueryBuilder('Dicom')
      .where('Dicom.researchId = :researchId', { researchId: research.id })
      .andWhere('Dicom.name = :dicomName', {
        dicomName: createDicomDto.name,
      })
      .andWhere('Dicom.dicomType = :dicomType', {
        dicomType: createDicomDto.dicomType,
      })
      .getOne();

    const dicom = existedDicom ? existedDicom : new Dicom();
    dicom.name = createDicomDto.name;
    dicom.description = createDicomDto.description;
    dicom.dicomType = createDicomDto.dicomType;
    dicom.research = research;
    dicom.status = DicomStatus.NOT_MARKED;
    dicom.isUploaded = false;
    dicom.markup = null;
    const savedDicom = await this.dicomRepository.save(dicom);

    return await this.makeGetDicomDto(savedDicom);
  }

  async update(
    id: string,
    updateDicomDto: UpdateDicomDto,
  ): Promise<GetDicomDto> {
    const dicom = await this.findDicomOrThrowException(id);

    if (!!updateDicomDto.description) {
      dicom.description = updateDicomDto.description;
    }
    if (updateDicomDto.isUploaded) {
      dicom.isUploaded = updateDicomDto.isUploaded;
    }
    if (!!updateDicomDto.markup) {
      dicom.markup = updateDicomDto.markup;
    }
    if (!!updateDicomDto.status) {
      this.validateStatusChanging(dicom.status, updateDicomDto.status);
      dicom.status = updateDicomDto.status;
    }
    const updatedDicom = await this.dicomRepository.save(dicom);

    return await this.makeGetDicomDto(updatedDicom);
  }

  async softDelete(id: string) {
    const dicom = await this.findDicomOrThrowException(id);
    await this.dicomRepository.softDelete(dicom.id);
  }

  async makeGetDicomDto(dicom: Dicom): Promise<GetDicomDto> {
    const dicomDto = new GetDicomDto();
    dicomDto.id = dicom.id;
    dicomDto.name = dicom.name;
    dicomDto.description = dicom.description;
    dicomDto.dicomType = dicom.dicomType;
    dicomDto.isUploaded = dicom.isUploaded;
    dicomDto.researchId = dicom.researchId;
    if (!dicom.isUploaded) {
      dicomDto.uploadingUrl = await this.cloudService.getS3PresignedUrl(
        `${dicom.researchId}/${dicom.dicomType}/${dicom.id}/dicom`,
        S3PresignedUrlOperation.PUT_OBJECT,
      );
    } else {
      dicomDto.downloadingUrl = this.cloudService.makePublicUrl(
        `${dicom.researchId}/${dicom.dicomType}/${dicom.id}/dicom`,
      );
    }
    dicomDto.markup = dicom.markup;
    dicomDto.status = dicom.status;
    dicomDto.createdAt = dicom.createdAt;
    dicomDto.updatedAt = dicom.updatedAt;
    dicomDto.deletedAt = dicom.deletedAt;

    return dicomDto;
  }

  async findDicomOrThrowException(id: string): Promise<Dicom> {
    const dicom = await this.dicomRepository.findOneBy({ id: id });
    if (!dicom) {
      throw new BadRequestException('DICOM file does not exist');
    }
    return dicom;
  }

  async makeRedirectPublicUrl(path: string): Promise<string> {
    return await this.cloudService.getS3PresignedUrl(
      path,
      S3PresignedUrlOperation.GET_OBJECT,
    );
  }

  validateStatusChanging(currentStatus: DicomStatus, newStatus: DicomStatus) {
    if (
      !this.availableStatusChanges.includes(`${currentStatus}-${newStatus}`)
    ) {
      throw new BadRequestException(
        `Not valid operation of changing status '${currentStatus}' on '${newStatus}'`,
      );
    }
  }
}
