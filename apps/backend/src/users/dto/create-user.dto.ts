import { IsEmail, IsString, IsEnum, IsDateString, Length, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsStrongPassword()
  password!: string;

  @IsString()
  @Length(1, 255)
  full_name!: string;

  @IsEnum(['male', 'female', 'nonbinary'])
  gender!: string;

  @IsEnum(['straight','gay','lesbian','bisexual','asexual','demisexual','pansexual','queer','questioning'])
  sexual_orientation!: string;

  @IsDateString()
  birth_date!: string;
}
