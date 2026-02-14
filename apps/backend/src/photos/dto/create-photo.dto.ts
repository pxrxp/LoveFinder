import { IsUrl, IsOptional, IsBoolean } from 'class-validator';

export class CreatePhotoDto {
  @IsUrl()
  image_url!: string;

  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;
}

