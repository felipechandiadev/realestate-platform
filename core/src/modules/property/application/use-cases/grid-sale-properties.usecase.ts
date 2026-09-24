import { Injectable } from '@nestjs/common';
import { Property } from '../../domain/property.entity';
import { PropertyRepository } from '../../domain/property.repository';
import { PropertyStatus } from '../../../../shared/enums/property-status.enum';
import { PropertyOperationType } from '../../../../shared/enums/property-operation-type.enum';

type GridSaleQuery = {
  search?: string;
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bedroomsOperator?: 'lte' | 'eq' | 'gte';
  bathrooms?: number;
  bathroomsOperator?: 'lte' | 'eq' | 'gte';
  parkingSpaces?: number;
  parkingSpacesOperator?: 'lte' | 'eq' | 'gte';
  state?: string;
  city?: string;
  typeProperty?: string;
  currency?: string;
  sort?: string;
  sortField?: string;
  page?: number;
  limit?: number;
  filtration?: string | boolean;
  filters?: string;
  status?: string;
};

function parseGridFilters(filters?: string): Record<string, string> {
  if (!filters) return {};
  const result: Record<string, string> = {};
  for (const pair of filters.split(',')) {
    const [column, ...valueParts] = pair.split('-');
    if (!column || valueParts.length === 0) continue;
    const raw = valueParts.join('-');
    try {
      result[column] = decodeURIComponent(raw);
    } catch {
      result[column] = raw;
    }
  }
  return result;
}

@Injectable()
export class GridSalePropertiesUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(dto: GridSaleQuery): Promise<{
    data: Property[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    console.log('🔍 [GridSalePropertiesUseCase] Starting with filters:', dto);

    const limit = dto.limit || 9;
    const page = Math.max(1, dto.page || 1);
    const skip = (page - 1) * limit;
    const columnFilters = parseGridFilters(dto.filters);

    let query = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.propertyType', 'pt')
      .leftJoinAndSelect('property.multimedia', 'multimedia')
      .leftJoinAndSelect('multimedia.variants', 'variants')
      .leftJoinAndSelect('property.creatorUser', 'creatorUser')
      .leftJoinAndSelect('property.assignedAgent', 'assignedAgent')
      .where('property.operationType = :operationType', {
        operationType: PropertyOperationType.SALE,
      })
      .andWhere('property.deletedAt IS NULL');

    // Status: column filter > query status > default PUBLISHED (portal-safe).
    // `ALL` = no status restriction (backoffice).
    const statusFilter = (columnFilters.status || dto.status || '').trim();
    if (statusFilter && statusFilter.toUpperCase() !== 'ALL') {
      query = query.andWhere('property.status = :status', { status: statusFilter });
    } else if (!statusFilter) {
      query = query.andWhere('property.status = :status', {
        status: PropertyStatus.PUBLISHED,
      });
    }

    // Other column filters from DataGrid URL
    if (columnFilters.code) {
      query = query.andWhere('LOWER(property.code) LIKE LOWER(:code)', {
        code: `%${columnFilters.code}%`,
      });
    }
    if (columnFilters.title) {
      query = query.andWhere('LOWER(property.title) LIKE LOWER(:title)', {
        title: `%${columnFilters.title}%`,
      });
    }
    if (columnFilters.city) {
      query = query.andWhere('LOWER(property.city) LIKE LOWER(:cityFilter)', {
        cityFilter: `%${columnFilters.city}%`,
      });
    }
    if (columnFilters.state) {
      query = query.andWhere('LOWER(property.state) LIKE LOWER(:stateFilter)', {
        stateFilter: `%${columnFilters.state}%`,
      });
    }
    if (columnFilters.typeName) {
      query = query.andWhere('LOWER(pt.name) LIKE LOWER(:typeName)', {
        typeName: `%${columnFilters.typeName}%`,
      });
    }
    if (columnFilters.creatorName) {
      query = query.andWhere(
        `(LOWER(COALESCE(creatorUser.username, '')) LIKE LOWER(:creatorName)
          OR LOWER(COALESCE(creatorUser.email, '')) LIKE LOWER(:creatorName))`,
        { creatorName: `%${columnFilters.creatorName}%` },
      );
    }
    if (columnFilters.assignedAgentName) {
      query = query.andWhere(
        `(LOWER(COALESCE(assignedAgent.username, '')) LIKE LOWER(:agentName)
          OR LOWER(COALESCE(assignedAgent.email, '')) LIKE LOWER(:agentName))`,
        { agentName: `%${columnFilters.assignedAgentName}%` },
      );
    }

    // Apply search filter
    if (dto.search && dto.search.trim() !== '') {
      const searchTerm = `%${dto.search.trim()}%`;
      query = query.andWhere(
        '(LOWER(property.title) LIKE LOWER(:search) OR LOWER(property.description) LIKE LOWER(:search))',
        { search: searchTerm },
      );
    }

    if (dto.priceMin !== undefined) {
      query = query.andWhere('property.price >= :priceMin', { priceMin: dto.priceMin });
    }
    if (dto.priceMax !== undefined) {
      query = query.andWhere('property.price <= :priceMax', { priceMax: dto.priceMax });
    }

    if (dto.bedrooms !== undefined && dto.bedrooms > 0) {
      const operator = dto.bedroomsOperator || 'gte';
      switch (operator) {
        case 'lte':
          query = query.andWhere('property.bedrooms <= :bedrooms', { bedrooms: dto.bedrooms });
          break;
        case 'eq':
          query = query.andWhere('property.bedrooms = :bedrooms', { bedrooms: dto.bedrooms });
          break;
        case 'gte':
        default:
          query = query.andWhere('property.bedrooms >= :bedrooms', { bedrooms: dto.bedrooms });
      }
    }

    if (dto.bathrooms !== undefined && dto.bathrooms > 0) {
      const operator = dto.bathroomsOperator || 'gte';
      switch (operator) {
        case 'lte':
          query = query.andWhere('property.bathrooms <= :bathrooms', { bathrooms: dto.bathrooms });
          break;
        case 'eq':
          query = query.andWhere('property.bathrooms = :bathrooms', { bathrooms: dto.bathrooms });
          break;
        case 'gte':
        default:
          query = query.andWhere('property.bathrooms >= :bathrooms', { bathrooms: dto.bathrooms });
      }
    }

    if (dto.parkingSpaces !== undefined && dto.parkingSpaces > 0) {
      const operator = dto.parkingSpacesOperator || 'gte';
      switch (operator) {
        case 'lte':
          query = query.andWhere('property.parkingSpaces <= :parkingSpaces', {
            parkingSpaces: dto.parkingSpaces,
          });
          break;
        case 'eq':
          query = query.andWhere('property.parkingSpaces = :parkingSpaces', {
            parkingSpaces: dto.parkingSpaces,
          });
          break;
        case 'gte':
        default:
          query = query.andWhere('property.parkingSpaces >= :parkingSpaces', {
            parkingSpaces: dto.parkingSpaces,
          });
      }
    }

    if (dto.typeProperty) {
      query = query.andWhere('pt.name = :typeProperty', { typeProperty: dto.typeProperty });
    }
    if (dto.state) {
      query = query.andWhere('property.state = :state', { state: dto.state });
    }
    if (dto.city) {
      query = query.andWhere('property.city = :city', { city: dto.city });
    }
    if (dto.currency && dto.currency !== 'all') {
      query = query.andWhere('property.currencyPrice = :currency', { currency: dto.currency });
    }

    // Sorting: DataGrid sends sortField + sort (asc|desc); portal may send sort=price_asc
    if (dto.sortField && (dto.sort === 'asc' || dto.sort === 'desc')) {
      const direction = dto.sort.toUpperCase() as 'ASC' | 'DESC';
      const allowed: Record<string, string> = {
        code: 'property.code',
        title: 'property.title',
        status: 'property.status',
        typeName: 'pt.name',
        city: 'property.city',
        state: 'property.state',
        price: 'property.price',
        createdAt: 'property.createdAt',
        updatedAt: 'property.updatedAt',
      };
      const orderCol = allowed[dto.sortField] || 'property.createdAt';
      query = query.orderBy(orderCol, direction);
    } else if (dto.sort) {
      const [field, order] = dto.sort.split('_');
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

    const total = await query.getCount();
    const data = await query.skip(skip).take(limit).getMany();

    const totalPages = Math.ceil(total / limit);

    const enrichedData = data.map((property) => {
      const row = property as any;
      row.typeName = property.propertyType?.name ?? null;
      row.creatorName = this.resolveUserDisplayName(property.creatorUser);
      row.assignedAgentName = this.resolveUserDisplayName(property.assignedAgent);
      row.imageUrls = this.resolveImageUrls(property);
      return row;
    });

    return { data: enrichedData, total, page, limit, totalPages };
  }

  /** URLs de imagen para carrusel en cards (main primero, sin duplicados). */
  private resolveImageUrls(property: Property): string[] {
    const urls: string[] = [];
    const push = (raw?: string | null) => {
      const url = typeof raw === 'string' ? raw.trim() : '';
      if (!url || urls.includes(url)) return;
      urls.push(url);
    };

    push(property.mainImageUrl);

    for (const media of property.multimedia || []) {
      if ((media as any).deletedAt) continue;
      const format = String((media as any).format || '').toUpperCase();
      if (format && format !== 'IMG') continue;
      push((media as any).url);
    }

    return urls;
  }

  private resolveUserDisplayName(user?: any): string | null {
    if (!user) return null;
    const firstName =
      typeof user.personalInfo?.firstName === 'string' ? user.personalInfo.firstName.trim() : '';
    const lastName =
      typeof user.personalInfo?.lastName === 'string' ? user.personalInfo.lastName.trim() : '';
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;
    if (typeof user.username === 'string') return user.username;
    if (typeof user.email === 'string') return user.email;
    return null;
  }
}
