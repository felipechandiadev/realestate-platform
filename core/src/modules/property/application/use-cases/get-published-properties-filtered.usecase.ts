import { Injectable } from '@nestjs/common';
import { PropertyRepository } from '../../domain/property.repository';
import { Property } from '../../domain/property.entity';
import { PropertyStatus } from '../../../../shared/enums/property-status.enum';
import { PropertyOperationType } from '../../../../shared/enums/property-operation-type.enum';
import { MultimediaType, MultimediaFormat } from '../../../multimedia/domain/multimedia.entity';
import { applyPublishedPropertyFilters } from './apply-published-property-filters';

@Injectable()
export class GetPublishedPropertiesFilteredUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(
    filters: any,
    operationType?: PropertyOperationType,
  ): Promise<{
    data: Property[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    try {
      const limit = parseInt(filters.limit, 10) || 9;
      const page = Math.max(1, parseInt(filters?.page, 10) || 1);
      const skip = (page - 1) * limit;

      let query = this.propertyRepository
        .createQueryBuilder('property')
        .leftJoinAndSelect('property.propertyType', 'pt')
        .where('property.status = :status', { status: PropertyStatus.PUBLISHED })
        .andWhere('property.deletedAt IS NULL');

      if (operationType) {
        query = query.andWhere('property.operationType = :operationType', { operationType });
      }

      query = applyPublishedPropertyFilters(query, filters ?? {});

      // Sorting
      if (filters.sort) {
        const [field, order] = String(filters.sort).split('_');
        const sortOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        switch (field) {
          case 'price':
            query = query.orderBy('property.price', sortOrder);
            break;
          case 'created':
            query = query.orderBy('property.createdAt', sortOrder);
            break;
          case 'title':
            query = query.orderBy('property.title', sortOrder);
            break;
          default:
            query = query.orderBy('property.createdAt', 'DESC');
        }
      } else {
        query = query.orderBy('property.createdAt', 'DESC');
      }

      query = query
        .leftJoinAndSelect('property.multimedia', 'multimedia')
        .leftJoinAndSelect('multimedia.variants', 'variants');

      const total = await query.getCount();
      let data = await query.skip(skip).take(limit).getMany();

      for (const property of data) {
        const isVideoUrl = (url: string) => {
          const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
          return videoExtensions.some((ext) => url.toLowerCase().includes(ext));
        };

        const needsImageFallback =
          !property.mainImageUrl ||
          property.mainImageUrl.trim() === '' ||
          isVideoUrl(property.mainImageUrl);

        if (needsImageFallback) {
          const imageMultimedia = property.multimedia?.find(
            (m) => m.format === MultimediaFormat.IMG && m.type === MultimediaType.PROPERTY_IMG,
          );
          if (imageMultimedia) {
            property.mainImageUrl = imageMultimedia.url;
          }
        }
      }

      const normalizeUrl = (url: string): string => {
        if (!url) return url;
        if (url.includes('/properties/img/') || url.includes('/properties/video/')) {
          return url;
        }
        if (
          url.includes('/public/properties/') &&
          !url.includes('/properties/img/') &&
          !url.includes('/properties/video/')
        ) {
          return url.replace('/public/properties/', '/public/properties/img/');
        }
        return url;
      };

      for (const property of data) {
        if (property.mainImageUrl) {
          property.mainImageUrl = normalizeUrl(property.mainImageUrl);
        }
      }

      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      };
    } catch (error) {
      console.error('❌ Error in getPublishedPropertiesFiltered:', error);
      throw error;
    }
  }
}
