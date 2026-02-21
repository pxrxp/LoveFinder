import {
  IsEmail,
  IsString,
  IsEnum,
  IsDateString,
  Length,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsStrongPassword()
  password!: string;
}
