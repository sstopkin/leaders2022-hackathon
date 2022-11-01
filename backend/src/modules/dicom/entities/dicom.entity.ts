import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Research } from '../../research/entities/research.entity';
import { IsOptional } from 'class-validator';
import { DicomStatus } from './dicom.status';

@Entity({ name: 'dicoms' })
@Index('dicomsResearchIdNameUniqueIdx', ['researchId', 'name'], {
  unique: true,
})
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

  @ApiProperty({ description: 'If DICOM file is uploaded' })
  @Column({ type: 'boolean', default: false })
  public isUploaded: boolean;

  @ManyToOne(() => Research, (research) => research.dicoms)
  @JoinColumn({ name: 'researchId', referencedColumnName: 'id' })
  public research: Research;

  @Column()
  @Index('dicomsResearchIdIdx')
  researchId: string;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  public markup?: any;

  @ApiProperty({ description: 'DICOM file status', example: 'in_markup' })
  @Column({
    name: 'status',
    type: 'enum',
    enum: DicomStatus,
    default: DicomStatus.NOT_MARKED,
  })
  public status: DicomStatus;

  @ApiProperty({ description: 'Research creation timestamp' })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public createdAt: Date;

  @ApiProperty({ description: 'Research update timestamp' })
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updatedAt: Date;

  @ApiProperty({ description: 'Research deletion timestamp' })
  @DeleteDateColumn({
    type: 'timestamp',
  })
  public deletedAt?: Date;
}
