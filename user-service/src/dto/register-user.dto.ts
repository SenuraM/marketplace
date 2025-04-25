import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from 'src/entities/user.entity';

export class RegisterUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  role: UserRole.BUYER | UserRole.SELLER;

  @IsString()
  @IsNotEmpty()
  country: string;
}