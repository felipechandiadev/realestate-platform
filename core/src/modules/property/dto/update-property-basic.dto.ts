import { IsOptional, IsString, IsEnum, IsUUID, IsBoolean, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { PropertyStatus } from '../../../shared/enums/property-status.enum';
import { PropertyOperationType } from '../../../shared/enums/property-operation-type.enum';

/**
 * DTO para actualizar solo la información básica de una propiedad.
 * Campos permitidos:
 * - title
 * - description
 * - status
 * - operationType
 * - propertyTypeId
 * - assignedAgentId
 * - isFeatured
 * - price
 * - currencyPrice
 */
export class UpdatePropertyBasicDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PropertyStatus, {
    message: 'El estado de la propiedad no es válido',
  })
  status?: PropertyStatus;

  @IsOptional()
  @IsEnum(PropertyOperationType, {
    message: 'El tipo de operación no es válido',
  })
  operationType?: PropertyOperationType;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsUUID('4', { message: 'El tipo de propiedad no es válido' })
  propertyTypeId?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsUUID('4', { message: 'El agente asignado no es válido' })
  assignedAgentId?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'El precio debe ser un número' })
  price?: number;

  @IsOptional()
  @IsString()
  @IsEnum(['CLP', 'UF'], { message: 'La moneda debe ser CLP o UF' })
  currencyPrice?: string;
}
