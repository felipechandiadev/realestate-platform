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
    if (dto.bedrooms !== undefined) {
      query.andWhere('property.bedrooms >= :bedrooms', { bedrooms: dto.bedrooms });
    }
    if (dto.bathrooms !== undefined) {
      query.andWhere('property.bathrooms >= :bathrooms', { bathrooms: dto.bathrooms });
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

    const total = await query.getCount();
    const data = await query
      .leftJoinAndSelect('property.multimedia', 'multimedia')
      .skip(skip)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);
    return { data, total, page, limit, totalPages };
  }
}
