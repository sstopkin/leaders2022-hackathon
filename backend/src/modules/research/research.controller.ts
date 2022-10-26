import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResearchService } from './research.service';
import { CreateResearchDto } from './dto/create-research.dto';
import { UpdateResearchDto } from './dto/update-research.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../user/entities/user.role';
import RoleGuard from '../auth/guards/role.guard';
import { Research } from './entities/research.entity';
import { PageDto } from '../../core/dto/find_all/page.dto';
import { FindAllOptionsDto } from '../../core/dto/find_all/find_all_options.dto';
import { ApiPaginatedResponse } from '../../core/api_docs/api_paginated_response';
import { isQueryFailedError, PostgresErrorCode } from '../../core/db/db_errors';

@Controller('research')
@ApiTags('Research')
@ApiBearerAuth()
export class ResearchController {
  private readonly logger = new Logger(ResearchController.name);

  constructor(private readonly service: ResearchService) {}

  @Get()
  @ApiPaginatedResponse(Research)
  @UseGuards(RoleGuard([UserRole.ADMIN, UserRole.USER]))
  findAll(
    @Query() options: FindAllOptionsDto,
  ): Promise<Research[] | PageDto<Research>> {
    return this.service.findAll(options);
  }

  @Get(':id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Research',
    type: Research,
  })
  @UseGuards(RoleGuard([UserRole.ADMIN, UserRole.USER]))
  findOne(@Param('id') id: string): Promise<Research> {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(RoleGuard([UserRole.ADMIN]))
  create(@Body() dto: CreateResearchDto): Promise<void> {
    return this.handleResearchUniqueError(() => this.service.create(dto));
  }

  @Patch(':id')
  @UseGuards(RoleGuard([UserRole.ADMIN, UserRole.USER], true))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateResearchDto,
  ): Promise<Research> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard([UserRole.ADMIN]))
  delete(@Param('id') id: string): Promise<void> {
    return this.service.softDelete(id);
  }

  async handleResearchUniqueError(func: () => Promise<void>) {
    try {
      return await func();
    } catch (error) {
      if (isQueryFailedError(error)) {
        switch (error.code) {
          case PostgresErrorCode.UniqueViolation: {
            throw new BadRequestException(
              `There is another research with this name.`,
            );
          }
          case PostgresErrorCode.ForeignKeyViolation: {
            throw new BadRequestException(`Related fields values are wrong.`);
          }
          default: {
            const errMessage = 'Error during updating research';
            this.logger.error(`${errMessage}: ${error}`);
            throw new InternalServerErrorException(errMessage);
          }
        }
      }
      throw error;
    }
  }
}
