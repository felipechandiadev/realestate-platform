import { IsString, IsOptional, Matches, IsNumber, IsDateString, IsBoolean, Min, Max, MinLength, MaxLength, ValidateIf } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SlidePresentationDto } from './slide-presentation.dto';

const INTERNAL_OR_ABSOLUTE_URL = /^(https?:\/\/\S+|\/\S*)$/;

export class CreateSlideWithMultimediaDto extends SlidePresentationDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? null : value))
  @ValidateIf((_, value) => value != null && String(value).trim() !== '')
  @IsString()
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  @MaxLength(255, { message: 'El título no puede exceder 255 caracteres' })
  title?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ValidateIf((_, value) => value != null && String(value).trim() !== '')
  @Matches(INTERNAL_OR_ABSOLUTE_URL, {
    message: 'La URL debe ser http(s) o una ruta interna que empiece con /',
  })
  linkUrl?: string | null;

  @Transform(({ value }) => value ? parseInt(value, 10) : 3)
  @Type(() => Number)
  @IsNumber({}, { message: 'La duración debe ser un número' })
  @Min(1, { message: 'La duración mínima es 1 segundo' })
  @Max(60, { message: 'La duración máxima es 60 segundos' })
  duration: number = 3;

  @IsOptional()
  @IsDateString({}, { message: 'Debe ser una fecha válida' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Debe ser una fecha válida' })
  endDate?: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'isActive debe ser true o false' })
  isActive: boolean = true;

  // Metadatos opcionales para multimedia
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  multimediaDescription?: string;
}