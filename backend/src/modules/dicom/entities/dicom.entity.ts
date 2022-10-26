import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DicomType } from './dicom.type';
import { Research } from '../../research/entities/research.entity';

@Entity({ name: 'dicoms' })
export class Dicom {
  @ApiProperty({
    description: 'ID',
    example: 'bf572c89-9105-431c-bd81-0c4053b50e8a',
  })
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ApiProperty({ description: 'DICOM file name', example: 'DICOM file' })
  @Column()
  public name: string;

  @ApiProperty({
    description: 'Description',
    example: 'Some DICOM file description',
  })
  @Column({ name: 'description', nullable: true })
  public description: string;

  @ApiProperty({ description: 'DICOM file type', example: 'original' })
  @Column({
    type: 'enum',
    enum: DicomType,
    default: DicomType.ORIGINAL,
  })
  public dicomType: DicomType;

  @ApiProperty({ description: 'If DICOM file is uploaded' })
  @Column({ type: 'boolean', default: false })
  public isUploaded: boolean;

  @ManyToOne(() => Research)
  @JoinColumn({ name: 'researchId', referencedColumnName: 'id' })
  public research: Research;

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
