import { Injectable } from '@nestjs/common';
import { IsNull } from 'typeorm';
import { Property } from '../../domain/property.entity';
import { PropertyRepository } from '../../domain/property.repository';
import { FilterRentPropertiesDto } from '../..//dto/filter-rent-properties.dto';
import { PropertyStatus } from '../../../../shared/enums/property-status.enum';
import { PropertyOperationType } from '../../../../shared/enums/property-operation-type.enum';

@Injectable()
export class GridRentPropertiesUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  private resolveUserDisplayName(user?: any): string | null {
    if (!user) return null;

    const firstName =
      typeof user.personalInfo?.firstName === 'string'
        ? user.personalInfo.firstName.trim()
        : '';
    const lastName =
      typeof user.personalInfo?.lastName === 'string'
        ? user.personalInfo.lastName.trim()
        : '';
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) return fullName;
    if (typeof user.username === 'string' && user.username.trim() !== '') {
      return user.username;
    }
    if (typeof user.email === 'string' && user.email.trim() !== '') {
      return user.email;
    }

    return null;
  }

  async execute(dto: FilterRentPropertiesDto): Promise<{
    data: Property[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const limit = dto.limit || 9;
    const page = Math.max(1, dto.page || 1);
    const skip = (page - 1) * limit;

    let query = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.propertyType', 'pt')
      .where('property.status = :status', { status: PropertyStatus.PUBLISHED })
      .andWhere('property.operationType = :operationType', { operationType: PropertyOperationType.RENT })
      .andWhere('property.deletedAt IS NULL');

    if (dto.search && dto.search.trim() !== '') {
      const term = `%${dto.search.trim()}%`;
      query.andWhere(
        '(LOWER(property.title) LIKE LOWER(:search) OR LOWER(property.description) LIKE LOWER(:search))',
        { search: term },
      );
    }

    if (dto.priceMin !== undefined) {
      query.andWhere('property.price >= :priceMin', { priceMin: dto.priceMin });
    }
    if (dto.priceMax !== undefined) {
      query.andWhere('property.price <= :priceMax', { priceMax: dto.priceMax });
    }

    // Apply bedroom filter with operator
    if (dto.bedrooms !== undefined && dto.bedrooms > 0) {
      const operator = dto.bedroomsOperator || 'gte';
      switch (operator) {
        case 'lte':
          query.andWhere('property.bedrooms <= :bedrooms', { bedrooms: dto.bedrooms });
          break;
        case 'eq':
          query.andWhere('property.bedrooms = :bedrooms', { bedrooms: dto.bedrooms });
          break;
        case 'gte':
        default:
          query.andWhere('property.bedrooms >= :bedrooms', { bedrooms: dto.bedrooms });
      }
    }

    // Apply bathroom filter with operator
    if (dto.bathrooms !== undefined && dto.bathrooms > 0) {
      const operator = dto.bathroomsOperator || 'gte';
      switch (operator) {
        case 'lte':
          query.andWhere('property.bathrooms <= :bathrooms', { bathrooms: dto.bathrooms });
          break;
        case 'eq':
          query.andWhere('property.bathrooms = :bathrooms', { bathrooms: dto.bathrooms });
          break;
        case 'gte':
        default:
          query.andWhere('property.bathrooms >= :bathrooms', { bathrooms: dto.bathrooms });
      }
    }

    // Apply parking filter with operator
    if (dto.parkingSpaces !== undefined && dto.parkingSpaces > 0) {
      const operator = dto.parkingSpacesOperator || 'gte';
      switch (operator) {
        case 'lte':
          query.andWhere('property.parkingSpaces <= :parkingSpaces', { parkingSpaces: dto.parkingSpaces });
          break;
        case 'eq':
          query.andWhere('property.parkingSpaces = :parkingSpaces', { parkingSpaces: dto.parkingSpaces });
          break;
        case 'gte':
        default:
          query.andWhere('property.parkingSpaces >= :parkingSpaces', { parkingSpaces: dto.parkingSpaces });
      }
    }

    if (dto.typeProperty) {
      query.andWhere('pt.name = :typeProperty', { typeProperty: dto.typeProperty });
    }
    if (dto.state) {
      query.andWhere('property.state = :state', { state: dto.state });
    }
    if (dto.city) {
      query.andWhere('property.city = :city', { city: dto.city });
    }
    if (dto.currency && dto.currency !== 'all') {
      query.andWhere('property.currencyPrice = :currency', { currency: dto.currency });
    }

    if (dto.sort) {
      const [field, order] = dto.sort.split('_');
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

    // Add multimedia and user joins before getting count
    query
      .leftJoinAndSelect('property.multimedia', 'multimedia')
      .leftJoinAndSelect('multimedia.variants', 'variants')
      .leftJoinAndSelect('property.creatorUser', 'creatorUser')
      .leftJoinAndSelect('property.assignedAgent', 'assignedAgent');

    const total = await query.getCount();
    const data = await query
      .skip(skip)
      .take(limit)
      .getMany();

    const enrichedData = data.map((property) => {
      const row = property as Property & {
        typeName?: string | null;
        creatorName?: string | null;
        assignedAgentName?: string | null;
      };

      row.typeName = property.propertyType?.name ?? null;
      row.creatorName = this.resolveUserDisplayName((property as any).creatorUser);
      row.assignedAgentName = this.resolveUserDisplayName((property as any).assignedAgent);

      return row;
    });

    const totalPages = Math.ceil(total / limit);
    return { data: enrichedData, total, page, limit, totalPages };
  }
}
