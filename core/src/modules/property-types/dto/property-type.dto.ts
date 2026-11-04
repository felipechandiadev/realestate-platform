import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/** Largo máximo del nombre (la columna es varchar(255)). */
export const PROPERTY_TYPE_NAME_MAX = 255;
/** Largo máximo de la descripción. */
export const PROPERTY_TYPE_DESCRIPTION_MAX = 2000;

/** Recorta los textos (un nombre de solo espacios queda vacío y se rechaza). */
const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreatePropertyTypeDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(PROPERTY_TYPE_NAME_MAX)
  name: string;

  @Transform(trim)
  @IsString()
  @IsOptional()
  @MaxLength(PROPERTY_TYPE_DESCRIPTION_MAX)
  description?: string;

  @IsBoolean()
  @IsOptional()
  hasBedrooms?: boolean;

  @IsBoolean()
  @IsOptional()
  hasBathrooms?: boolean;

  @IsBoolean()
  @IsOptional()
  hasBuiltSquareMeters?: boolean;

  @IsBoolean()
  @IsOptional()
  hasLandSquareMeters?: boolean;

  @IsBoolean()
  @IsOptional()
  hasParkingSpaces?: boolean;

  @IsBoolean()
  @IsOptional()
  hasFloors?: boolean;

  @IsBoolean()
  @IsOptional()
  hasConstructionYear?: boolean;
}

export class UpdatePropertyTypeDto {
  /** Si se envía no puede quedar vacío. */
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(PROPERTY_TYPE_NAME_MAX)
  name?: string;

  /** Una descripción vacía la borra. */
  @Transform(trim)
  @IsString()
  @IsOptional()
  @MaxLength(PROPERTY_TYPE_DESCRIPTION_MAX)
  description?: string;

  @IsBoolean()
  @IsOptional()
  hasBedrooms?: boolean;

  @IsBoolean()
  @IsOptional()
  hasBathrooms?: boolean;

  @IsBoolean()
  @IsOptional()
  hasBuiltSquareMeters?: boolean;

  @IsBoolean()
  @IsOptional()
  hasLandSquareMeters?: boolean;

  @IsBoolean()
  @IsOptional()
  hasParkingSpaces?: boolean;

  @IsBoolean()
  @IsOptional()
  hasFloors?: boolean;

  @IsBoolean()
  @IsOptional()
  hasConstructionYear?: boolean;
}

export class UpdatePropertyTypeFeaturesDto {
  @IsBoolean()
  @IsOptional()
  hasBedrooms?: boolean;

  @IsBoolean()
  @IsOptional()
  hasBathrooms?: boolean;

  @IsBoolean()
  @IsOptional()
  hasBuiltSquareMeters?: boolean;

  @IsBoolean()
  @IsOptional()
  hasLandSquareMeters?: boolean;

  @IsBoolean()
  @IsOptional()
  hasParkingSpaces?: boolean;

  @IsBoolean()
  @IsOptional()
  hasFloors?: boolean;

  @IsBoolean()
  @IsOptional()
  hasConstructionYear?: boolean;
}
