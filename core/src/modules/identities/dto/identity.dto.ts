import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SocialMedia, Partnership, FAQItem } from '../domain/identity.entity';

export class CreateIdentityDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsEmail()
  mail: string;

  @IsNotEmpty()
  @IsString()
  businessHours: string;

  @IsOptional()
  @IsString()
  urlLogo?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialMedia)
  socialMedia?: SocialMedia;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Partnership)
  partnerships?: Partnership[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FAQItem)
  faqs?: FAQItem[];
}

export class UpdateIdentityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  mail?: string;

  @IsOptional()
  @IsString()
  businessHours?: string;

  @IsOptional()
  @IsString()
  urlLogo?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialMedia)
  socialMedia?: SocialMedia;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Partnership)
  partnerships?: Partnership[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FAQItem)
  faqs?: FAQItem[];

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const parsed = Math.round(Number(value));
    return Number.isFinite(parsed) ? parsed : value;
  })
  @IsInt()
  @Min(3)
  heroAutoplaySeconds?: number;
}
