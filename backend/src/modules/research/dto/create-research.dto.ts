import { ApiProperty } from '@nestjs/swagger';

export class CreateResearchDto {
  @ApiProperty({ description: 'Research name', example: 'Research' })
  public name: string;

  @ApiProperty({
    description: 'Description',
    example: 'Some research description',
  })
  public description: string;
}
