import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../../domain/property.entity';
import { Multimedia, MultimediaType } from '../../../multimedia/domain/multimedia.entity';
import { PropertyRepository } from '../../domain/property.repository';
import { PropertyStatus } from '../../../../shared/enums/property-status.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ListPublishedPublicUseCase {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    @InjectRepository(Multimedia)
    private readonly multimediaRepository: Repository<Multimedia>,
    private readonly config: ConfigService,
  ) {}

  async execute(): Promise<any[]> {
    const publicBaseUrl = (
      this.config.get<string>('BACKEND_PUBLIC_URL') ||
      process.env.BACKEND_PUBLIC_URL ||
      ''
    ).replace(/\/$/, '');

    const qb = this.propertyRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.propertyType', 'pt')
      .leftJoinAndSelect('p.multimedia', 'multimedia')
      .leftJoinAndSelect('multimedia.variants', 'variants')
      .where('p.deletedAt IS NULL')
      .andWhere('p.status = :status', { status: PropertyStatus.PUBLISHED })
      .orderBy('p.publishedAt', 'DESC')
      .addOrderBy('p.createdAt', 'DESC');

    const items = await qb.getMany();

    const normalize = (u?: string | null) =>
      u && u.trim() !== '' ? u.replace('/../', '/') : null;

    const toAbsoluteMediaUrl = (u?: string | null): string | null => {
      if (!u) return null;
      const cleaned = u.replace('/../', '/');
      try {
        new URL(cleaned);
        return cleaned;
      } catch {
        if (cleaned.startsWith('/public/')) {
          if (publicBaseUrl) return `${publicBaseUrl}${cleaned}`;
          return cleaned;
        }
        if (cleaned.startsWith('/uploads/')) {
          if (publicBaseUrl) return `${publicBaseUrl}/public${cleaned}`;
          return cleaned;
        }
        return cleaned;
      }
    };

    return items.map(p => {
      const hasMainImage = p.mainImageUrl && p.mainImageUrl.trim() !== '';
      const result: any = {
        id: p.id,
        title: p.title,
        description: p.description ?? null,
        status: p.status,
        operationType: p.operationType,
        price: p.price,
        currencyPrice: p.currencyPrice,
        state: p.state ?? null,
        city: p.city ?? null,
        propertyType: p.propertyType
          ? {
              id: p.propertyType.id,
              name: p.propertyType.name,
              hasBedrooms: p.propertyType.hasBedrooms,
              hasBathrooms: p.propertyType.hasBathrooms,
              hasBuiltSquareMeters: p.propertyType.hasBuiltSquareMeters,
              hasLandSquareMeters: p.propertyType.hasLandSquareMeters,
              hasParkingSpaces: p.propertyType.hasParkingSpaces,
              hasFloors: p.propertyType.hasFloors,
              hasConstructionYear: p.propertyType.hasConstructionYear,
            }
          : null,
        mainImageUrl: hasMainImage
          ? toAbsoluteMediaUrl(normalize(p.mainImageUrl))
          : null,
        bedrooms: p.bedrooms ?? null,
        bathrooms: p.bathrooms ?? null,
        builtSquareMeters: p.builtSquareMeters ?? null,
        landSquareMeters: p.landSquareMeters ?? null,
        parkingSpaces: p.parkingSpaces ?? null,
        isFeatured: !!p.isFeatured,
        multimedia: p.multimedia?.map(m => ({
          id: m.id,
          url: toAbsoluteMediaUrl(m.url),
          type: m.type,
          format: m.format,
          variants: m.variants?.map(v => ({
            id: v.id,
            variantType: v.variantType,
            format: v.format,
            width: v.width,
            height: v.height,
            size: v.size,
            url: toAbsoluteMediaUrl(v.url),
          })) || [],
        })) || [],
      };

      return result;
    });
  }
}
