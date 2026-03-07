import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterSalePropertiesDto {
  @IsOptional()
  @IsString()
  search?: string;

  // Price filters
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMax?: number;

  // Property features with operators
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  bedrooms?: number;

  @IsOptional()
  @IsString()
  @IsEnum(['lte', 'eq', 'gte'], { message: 'bedroomsOperator must be lte, eq, or gte' })
  bedroomsOperator?: 'lte' | 'eq' | 'gte' = 'gte';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  bathrooms?: number;

  @IsOptional()
  @IsString()
  @IsEnum(['lte', 'eq', 'gte'], { message: 'bathroomsOperator must be lte, eq, or gte' })
  bathroomsOperator?: 'lte' | 'eq' | 'gte' = 'gte';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  parkingSpaces?: number;

  @IsOptional()
  @IsString()
  @IsEnum(['lte', 'eq', 'gte'], { message: 'parkingSpacesOperator must be lte, eq, or gte' })
  parkingSpacesOperator?: 'lte' | 'eq' | 'gte' = 'gte';

  // Location filters
  @IsOptional()
  @IsString()
  state?: string; // Region/State

  @IsOptional()
  @IsString()
  city?: string; // Commune/City

  // Property type
  @IsOptional()
  @IsString()
  typeProperty?: string; // e.g., 'Casa', 'Departamento'

  // Pricing
  @IsOptional()
  @IsString()
  currency?: string; // e.g., 'CLP', 'UF', 'USD'

  // Sorting
  @IsOptional()
  @IsString()
  sort?: string; // e.g., 'price_asc', 'created_desc'

  // Pagination
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}