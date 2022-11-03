import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ResearchStatus } from './research.status';
import { Dicom } from '../../dicom/entities/dicom.entity';
import { User } from '../../user/entities/user.entity';
import { ResearchGeneratingParams } from './research-generating-params.entity';
import { IsOptional } from 'class-validator';

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
  @Index('researchesNameIdx', { unique: true })
  public name: string;

  @ApiProperty({
    description: 'Description',
    example: 'Some research description',
  })
  @Column({ name: 'description', nullable: true })
  public description: string;

  @ApiProperty({
    description: 'DICOM files',
  })
  @OneToMany(() => Dicom, (dicom) => dicom.research)
  public dicoms: Dicom[];

  @ApiProperty({ description: 'Research status', example: 'created' })
  @Column({
    name: 'status',
    type: 'enum',
    enum: ResearchStatus,
    default: ResearchStatus.CREATED,
  })
  public status: ResearchStatus;

  @ManyToOne(() => Research)
  @JoinColumn({
    name: 'parentResearchId',
    referencedColumnName: 'id',
  })
  public parentResearch?: Research;

  @ApiProperty()
  @Column({ nullable: true })
  @Index('researchesParentResearchIdIdx')
  parentResearchId?: string;

  @Column({ type: 'json', nullable: true })
  public generatingParams?: ResearchGeneratingParams;

  @ApiProperty({ description: 'Markup' })
  @Column({ type: 'json', nullable: true })
  @IsOptional()
  public markup?: any;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdByUserId', referencedColumnName: 'id' })
  public createdBy: User;

  @ApiProperty()
  @Column()
  @Index('researchesUserIdIdx')
  createdByUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigneeUserId', referencedColumnName: 'id' })
  public assigneeUser: User;

  @ApiProperty()
  @Column({ nullable: true })
  @Index('researchesAssigneeUserIdIdx')
  assigneeUserId: string;

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
