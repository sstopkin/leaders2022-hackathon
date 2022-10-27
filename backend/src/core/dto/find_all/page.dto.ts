import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class PageDto<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ApiProperty()
  readonly count: number;

  @ApiProperty()
  readonly total: number;

  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly pageCount: number;

  constructor(
    data: T[],
    count: number,
    total: number,
    page: number,
    size: number,
  ) {
    this.data = data;
    this.count = count;
    this.total = total;
    this.page = page;
    this.pageCount = Math.ceil(this.total / size);
  }
}
