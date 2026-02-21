import {
  IsOptional,
  IsString,
  Length,
  IsArray,
  ArrayNotEmpty,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  full_name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 512)
  bio?: string;

  @IsOptional()
  @IsDateString()
  birth_date?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  sexual_orientation?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  pref_genders?: string[];

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(200)
  pref_min_age?: number;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(200)
  pref_max_age?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20000)
  pref_distance_radius_km?: number;

  @IsOptional()
  @IsBoolean()
  allow_messages_from_strangers?: boolean;

  @IsOptional()
  @IsBoolean()
  is_onboarded?: boolean;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;
}
