import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { FindAllOptionsDto } from '../../../core/dto/find_all/find_all_options.dto';

export class FindAllDicomDto extends FindAllOptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  public researchId?: string;
}
