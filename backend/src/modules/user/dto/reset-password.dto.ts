import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'E-mail address', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @ApiProperty({ description: 'Password', example: 'password1' })
  @IsString()
  @IsNotEmpty()
  public password: string;

  @ApiProperty({ description: 'Password confirmation', example: 'password1' })
  @IsString()
  @IsNotEmpty()
  public passwordConfirmation: string;

  @ApiProperty({
    description: 'Reset password token',
    example: '9445310e-78c9-4aac-b248-ed72fd72d11f',
  })
  @IsString()
  @IsNotEmpty()
  public resetToken: string;
}
