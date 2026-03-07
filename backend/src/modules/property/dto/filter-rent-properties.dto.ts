import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterRentPropertiesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMax?: number;

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

  @IsOptional()
  @IsString()
  typeProperty?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}
