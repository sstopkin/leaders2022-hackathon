import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ResearchStatus } from './research.status';
import { Dicom } from '../../dicom/entities/dicom.entity';

@Entity({ name: 'researches' })
export class Research {
  @ApiProperty({
    description: 'ID',
    example: 'bf572c89-9105-431c-bd81-0c4053b50e8a',
  })
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ApiProperty({ description: 'Research name', example: 'Research' })
  @Column()
  public name: string;

  @ApiProperty({
    description: 'Description',
    example: 'Some research description',
  })
  @Column({ name: 'description', nullable: true })
  public description: string;

  @ApiProperty({
    description: 'Original DICOM file',
  })
  @OneToOne(() => Dicom, (dicom) => dicom.research)
  public originalDicom: Dicom;

  @ApiProperty({
    description: 'Generated DICOM file',
  })
  @OneToOne(() => Dicom, (dicom) => dicom.research)
  public generatedDicom: Dicom;

  @ApiProperty({ description: 'Research status', example: 'created' })
  @Column({
    name: 'status',
    type: 'enum',
    enum: ResearchStatus,
    default: ResearchStatus.CREATED,
  })
  public status: ResearchStatus;

  @ApiProperty({ description: 'User creation timestamp' })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP()',
  })
  public createdAt: Date;

  @ApiProperty({ description: 'User update timestamp' })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP()',
  })
  public updatedAt: Date;

  @ApiProperty({ description: 'User deletion timestamp' })
  @DeleteDateColumn({
    type: 'timestamp',
  })
  public deletedAt?: Date;
}
