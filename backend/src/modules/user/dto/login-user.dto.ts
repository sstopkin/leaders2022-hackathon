import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ description: 'E-mail address', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @ApiProperty({ description: 'Password', example: 'password1' })
  @IsString()
  @IsNotEmpty()
  public password: string;
}
