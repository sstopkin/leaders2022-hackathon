import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from './user.role';

@Entity({ name: 'users' })
export class User {
  @ApiProperty({
    description: 'ID',
    example: 'bf572c89-9105-431c-bd81-0c4053b50e8a',
  })
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ApiProperty({ description: 'E-mail address', example: 'user@example.com' })
  @Column({ unique: true })
  public email: string;

  @Exclude()
  @Column({ name: 'password', select: false })
  public password: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  @Column()
  public firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Smith' })
  @Column()
  public lastName: string;

  @Column({ name: 'refreshToken', nullable: true, select: false })
  refreshToken?: string;

  @ApiProperty({ description: 'Role', example: 'Admin' })
  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  public role: UserRole;

  @ApiProperty({ description: 'Is active', example: 'true' })
  @Column({ name: 'isActive', default: true })
  public isActive: boolean;

  @ApiProperty({ description: 'Description', example: 'Some user description' })
  @Column({ name: 'description', nullable: true })
  public description: string;

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
