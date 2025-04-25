import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, ValidateIf } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'buyer' })
  @IsString()
  @IsNotEmpty()
  role: 'buyer' | 'seller';

  @ApiProperty({ example: 'United States', description: 'Country of residence (required for sellers)' })
  @ValidateIf(o => o.role === 'seller')
  @IsString()
  @IsNotEmpty()
  country: string;
}