import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secret_password' })
  @IsString()
  @Length(6, 100)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @Length(2, 100)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @Length(2, 100)
  lastName: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345' })
  @IsString()
  otpCode: string;
}

export class ResendOtpDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  email: string;
}

export class LoginDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'secret_password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}