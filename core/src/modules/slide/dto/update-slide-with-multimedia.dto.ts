import { IsString, IsOptional, Matches, IsBoolean, IsNumber, Min, Max, IsDateString, Length, ValidateIf } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SlidePresentationDto } from './slide-presentation.dto';

const INTERNAL_OR_ABSOLUTE_URL = /^(https?:\/\/\S+|\/\S*)$/;

export class UpdateSlideWithMultimediaDto extends SlidePresentationDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? null : value))
  @ValidateIf((_, value) => value != null && String(value).trim() !== '')
  @IsString({ message: 'El título debe ser texto' })
  @Length(3, 255, { message: 'El título debe tener entre 3 y 255 caracteres' })
  title?: string | null;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  description?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @ValidateIf((_, value) => value != null && String(value).trim() !== '')
  @Matches(INTERNAL_OR_ABSOLUTE_URL, {
    message: 'La URL debe ser http(s) o una ruta interna que empiece con /',
  })
  linkUrl?: string | null;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @Type(() => Number)
  @IsNumber({}, { message: 'La duración debe ser un número' })
  @Min(1, { message: 'La duración mínima es 1 segundo' })
  @Max(60, { message: 'La duración máxima es 60 segundos' })
  duration?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Fecha de inicio debe ser válida' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Fecha de fin debe ser válida' })
  endDate?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'isActive debe ser true o false' })
  isActive?: boolean;
}