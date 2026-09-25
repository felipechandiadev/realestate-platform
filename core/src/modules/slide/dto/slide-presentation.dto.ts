import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, ValidateIf } from 'class-validator';

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

function emptyToNull(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
}

export class SlidePresentationDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }) => emptyToNull(value))
  ctaLabel?: string | null;

  @IsOptional()
  @IsIn(['none', 'button', 'link'])
  ctaStyle?: 'none' | 'button' | 'link';

  @IsOptional()
  @IsIn(['left', 'center', 'right'])
  textAlign?: 'left' | 'center' | 'right';

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const parsed = Math.round(Number(value));
    return Number.isFinite(parsed) ? parsed : value;
  })
  @IsInt()
  @Min(0)
  @Max(90)
  overlayOpacity?: number;

  @IsOptional()
  @Transform(({ value }) => emptyToNull(value))
  @ValidateIf((_, value) => typeof value === 'string' && value.length > 0)
  @Matches(HEX_COLOR, { message: 'El color debe ser un hex de 6 dígitos (#RRGGBB)' })
  textColor?: string | null;

  @IsOptional()
  @Transform(({ value }) => emptyToNull(value))
  @ValidateIf((_, value) => typeof value === 'string' && value.length > 0)
  @Matches(HEX_COLOR, { message: 'El color debe ser un hex de 6 dígitos (#RRGGBB)' })
  ctaButtonBgColor?: string | null;

  @IsOptional()
  @Transform(({ value }) => emptyToNull(value))
  @ValidateIf((_, value) => typeof value === 'string' && value.length > 0)
  @Matches(HEX_COLOR, { message: 'El color debe ser un hex de 6 dígitos (#RRGGBB)' })
  ctaButtonTextColor?: string | null;

  @IsOptional()
  @Transform(({ value }) => emptyToNull(value))
  @ValidateIf((_, value) => typeof value === 'string' && value.length > 0)
  @Matches(HEX_COLOR, { message: 'El color debe ser un hex de 6 dígitos (#RRGGBB)' })
  ctaLinkColor?: string | null;
}
