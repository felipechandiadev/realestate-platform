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

  // Property type (single name, CSV names, or typeIds CSV)
  @IsOptional()
  @IsString()
  typeProperty?: string;

  @IsOptional()
  @IsString()
  typeIds?: string;

  @IsOptional()
  @IsString()
  types?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  builtSquareMetersMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  builtSquareMetersMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  landSquareMetersMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  landSquareMetersMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  constructionYearMin?: number;

  /** CSV of OTHER_FEATURE_KEYS e.g. POOL,BBQ */
  @IsOptional()
  @IsString()
  otherFeatures?: string;

  @IsOptional()
  @IsString()
  features?: string;

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