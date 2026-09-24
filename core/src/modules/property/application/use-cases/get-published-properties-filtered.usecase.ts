import { Injectable } from '@nestjs/common';
import { PropertyRepository } from '../../domain/property.repository';
import { Property } from '../../domain/property.entity';
import { PropertyStatus } from '../../../../shared/enums/property-status.enum';
import { PropertyOperationType } from '../../../../shared/enums/property-operation-type.enum';
import { MultimediaType, MultimediaFormat } from '../../../multimedia/domain/multimedia.entity';

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
      const limit = parseInt(filters.limit) || 9;
      const page = Math.max(1, parseInt(filters?.page) || 1);
      const skip = (page - 1) * limit;

      let query = this.propertyRepository
        .createQueryBuilder('property')
        .leftJoinAndSelect('property.propertyType', 'pt')
        .where('property.status = :status', { status: PropertyStatus.PUBLISHED })
        .andWhere('property.deletedAt IS NULL');

      if (operationType) {
        query = query.andWhere('property.operationType = :operationType', { operationType });
      }

      // Generic filters copied from legacy method
      if (filters?.operation && filters.operation !== '' && filters.operation !== null) {
        query = query.andWhere('property.operationType = :operation', {
          operation: filters.operation,
        });
      }

      if (filters?.typeProperty && filters.typeProperty !== '' && filters.typeProperty !== null) {
        query = query.andWhere('pt.name = :typeProperty', { typeProperty: filters.typeProperty });
      }

      if (filters?.state && filters.state !== '' && filters.state !== null) {
        query = query.andWhere('property.state = :state', { state: filters.state });
      }

      if (filters?.city && filters.city !== '' && filters.city !== null) {
        query = query.andWhere('property.city = :city', { city: filters.city });
      }

      if (filters?.currency && filters.currency !== '' && filters.currency !== 'all' && filters.currency !== null) {
        query = query.andWhere('property.currencyPrice = :currency', { currency: filters.currency });
      }

      // numeric filters with operators
      const numericFilter = (field: string, value: any, operator?: string) => {
        if (value && parseInt(value) > 0) {
          const op = operator || 'gte';
          const opMap: any = { lte: '<=', eq: '=', gte: '>=' };
          const sqlOp = opMap[op] || '>=';
          query = query.andWhere(`property.${field} ${sqlOp} :${field}`, { [field]: parseInt(value) });
        }
      };

      numericFilter('bedrooms', filters?.bedrooms, filters?.bedroomsOperator);
      numericFilter('bathrooms', filters?.bathrooms, filters?.bathroomsOperator);
      numericFilter('parkingSpaces', filters?.parkingSpaces, filters?.parkingSpacesOperator);

      if (filters?.builtSquareMetersMin && parseInt(filters.builtSquareMetersMin) > 0) {
        query = query.andWhere('property.builtSquareMeters >= :builtSquareMetersMin', {
          builtSquareMetersMin: parseInt(filters.builtSquareMetersMin),
        });
      }
      if (filters?.landSquareMetersMin && parseInt(filters.landSquareMetersMin) > 0) {
        query = query.andWhere('property.landSquareMeters >= :landSquareMetersMin', {
          landSquareMetersMin: parseInt(filters.landSquareMetersMin),
        });
      }
      if (filters?.constructionYearMin && parseInt(filters.constructionYearMin) > 0) {
        query = query.andWhere('property.constructionYear >= :constructionYearMin', {
          constructionYearMin: parseInt(filters.constructionYearMin),
        });
      }

      if (filters?.search && filters.search.trim() !== '') {
        const searchTerm = `%${filters.search.trim()}%`;
        query.andWhere(
          '(LOWER(property.title) LIKE LOWER(:search) OR LOWER(property.description) LIKE LOWER(:search))',
          { search: searchTerm },
        );
      }

      // Sorting
      if (filters.sort) {
        const [field, order] = filters.sort.split('_');
        const sortOrder = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        switch (field) {
          case 'price':
            query.orderBy('property.price', sortOrder);
            break;
          case 'created':
            query.orderBy('property.createdAt', sortOrder);
            break;
          case 'title':
            query.orderBy('property.title', sortOrder);
            break;
          default:
            query.orderBy('property.createdAt', 'DESC');
        }
      } else {
        query.orderBy('property.createdAt', 'DESC');
      }

      // Add multimedia joins before getting count and data
      query
        .leftJoinAndSelect('property.multimedia', 'multimedia')
        .leftJoinAndSelect('multimedia.variants', 'variants');

      const total = await query.getCount();
      let data = await query
        .orderBy('property.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getMany();

      // fallback multimedia logic
      const idsNeedingFallback = data
        .filter(p => !p.mainImageUrl || p.mainImageUrl.trim() === '')
        .map(p => p.id);

      if (idsNeedingFallback.length > 0) {
        for (const property of data) {
          const isVideoUrl = (url: string) => {
            const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
            return videoExtensions.some(ext => url.toLowerCase().includes(ext));
          };

          const needsImageFallback =
            !property.mainImageUrl ||
            property.mainImageUrl.trim() === '' ||
            isVideoUrl(property.mainImageUrl);

          if (needsImageFallback) {
            const imageMultimedia = property.multimedia?.find(
              m => m.format === MultimediaFormat.IMG && m.type === MultimediaType.PROPERTY_IMG,
            );
            if (imageMultimedia) {
              property.mainImageUrl = imageMultimedia.url;
            }
          }
        }
      }

      // normalize urls helper
      const normalizeUrl = (url: string): string => {
        if (!url) return url;
        if (url.includes('/properties/img/') || url.includes('/properties/video/')) {
          return url;
        }
        if (url.includes('/public/properties/') && !url.includes('/properties/img/') && !url.includes('/properties/video/')) {
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
