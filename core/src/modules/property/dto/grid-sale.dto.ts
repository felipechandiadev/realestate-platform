import { Transform } from 'class-transformer';
import { IsBooleanString, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GridSaleQueryDto {
  @IsOptional()
  @IsString()
  fields?: string; // comma-separated

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBooleanString()
  filtration?: string; // 'true' | 'false'

  @IsOptional()
  @IsString()
  filters?: string; // e.g. "status-PUBLISHED,city-Las Condes"

  /**
   * Status filter. Use `ALL` for backoffice (no status restriction).
   * Omitted defaults to PUBLISHED (portal-safe).
   * Column filters (`filters=status-…`) override this when present.
   */
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBooleanString()
  pagination?: string; // 'true' | 'false'

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : undefined))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : undefined))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
