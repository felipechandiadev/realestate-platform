import { IsOptional, IsString, IsEnum } from 'class-validator';
import { MultimediaType } from '../../multimedia/domain/multimedia.entity';

export class UploadPropertyMultimediaDto {
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(MultimediaType)
  type?: MultimediaType;
}