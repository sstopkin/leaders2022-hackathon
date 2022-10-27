import { BadRequestException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { FilterCondition, Order } from '../../constants';
import { FilterDto } from './filter.dto';
import { SortDto } from './sort.dto';

export class FindAllOptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  readonly filter?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  readonly or?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  readonly sort?: string[];

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  readonly limit?: number;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  get sorting(): SortDto[] {
    if (this.sort) {
      const sort = typeof this.sort === 'string' ? [this.sort] : this.sort;
      return sort.map((s: string) => {
        const splitted = s.split(',');
        try {
          return new SortDto(
            splitted[0],
            Object.entries(Order).find(([, val]) => val === splitted[1])[1],
          );
        } catch {
          throw new BadRequestException(
            `Unsupported sort direction: ${splitted[1]}`,
          );
        }
      });
    }
    return null;
  }

  get filterAnd(): FilterDto[] {
    if (this.filter) {
      return this.filtering(this.filter);
    }
  }

  get filterOr(): FilterDto[] {
    if (this.or) {
      return this.filtering(this.or);
    }
  }

  private filtering(reqFilter: string | string[]): FilterDto[] {
    const filter = typeof reqFilter === 'string' ? [reqFilter] : reqFilter;
    return filter.map((f: string) => {
      const splitted = f.split('||');
      try {
        return new FilterDto(
          splitted[0],
          Object.entries(FilterCondition).find(
            ([, val]) => val === splitted[1],
          )[1],
          splitted[2],
        );
      } catch {
        throw new BadRequestException(
          `Unsupported filter condition: ${splitted[1]}`,
        );
      }
    });
  }
}
