import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '../entities/user.role';

export class CreateUserDto {
  @ApiProperty({ description: 'E-mail address', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  @IsString()
  @IsNotEmpty()
  public firstName: string;

  @ApiPropertyOptional({ description: 'Middle name', example: 'John' })
  @IsOptional()
  @IsString()
  public middleName?: string;

  @ApiProperty({ description: 'Last name', example: 'Smith' })
  @IsString()
  @IsNotEmpty()
  public lastName: string;

  @ApiPropertyOptional({ description: 'Is user active?', example: 'true' })
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;

  @ApiProperty({ description: 'Password', example: 'password1' })
  @IsString()
  @IsNotEmpty()
  public password: string;

  @ApiProperty({ description: 'Password confirmation', example: 'password1' })
  @IsString()
  @IsNotEmpty()
  public passwordConfirmation: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
  })
  @IsString()
  @IsNotEmpty()
  public role: UserRole;

  @ApiPropertyOptional({ description: 'Description', example: 'text' })
  @IsOptional()
  @IsString()
  public description?: string;
}
