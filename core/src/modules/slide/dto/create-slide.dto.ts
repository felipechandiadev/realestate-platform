import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsInt, 
  MaxLength, 
  IsDateString, 
  Matches,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { SlidePresentationDto } from './slide-presentation.dto';

const INTERNAL_OR_ABSOLUTE_URL = /^(https?:\/\/\S+|\/\S*)$/;

export class CreateSlideDto extends SlidePresentationDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? null : value))
  @ValidateIf((_, value) => value != null && String(value).trim() !== '')
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title?: string | null;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  multimediaUrl?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ValidateIf((_, value) => value != null && String(value).trim() !== '')
  @Matches(INTERNAL_OR_ABSOLUTE_URL, {
    message: 'La URL debe ser http(s) o una ruta interna que empiece con /',
  })
  @MaxLength(500)
  linkUrl?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  duration?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  order?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}