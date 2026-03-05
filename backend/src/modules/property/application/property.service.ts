import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../domain/property.entity';
import { User } from '../../users/domain/user.entity';
import { Multimedia } from '../../multimedia/domain/multimedia.entity';
import { PropertyRepository } from '../domain/property.repository';
import { GetFullPropertyDto } from '../dto/get-full-property.dto';
import { FilterRentPropertiesDto } from '../dto/filter-rent-properties.dto';
import { FilterSalePropertiesDto } from '../dto/filter-sale-properties.dto';
import { UpdatePropertyLocationDto } from '../dto/update-property-location.dto';
import { UpdatePropertySeoDto } from '../dto/update-property-seo.dto';
import { UploadPropertyMultimediaDto } from '../dto/upload-property-multimedia.dto';
import { GridSaleQueryDto } from '../dto/grid-sale.dto';
import { PropertyStatus } from '../../../shared/enums/property-status.enum';
import { PropertyOperationType } from '../../../shared/enums/property-operation-type.enum';
import { IsNull } from 'typeorm';
import { MultimediaType, MultimediaFormat } from '../../multimedia/domain/multimedia.entity';

// application use-cases
import { CreatePropertyUseCase } from '../application/use-cases/create-property.usecase';
import { FindPropertiesUseCase } from '../application/use-cases/find-properties.usecase';
import { FindOnePropertyUseCase } from '../application/use-cases/find-one-property.usecase';
import { CountPropertiesUseCase } from '../application/use-cases/count-properties.usecase';
import { ToggleFavoriteUseCase } from '../application/use-cases/toggle-favorite.usecase';
import { MultimediaService as UploadMultimediaService } from '../../multimedia/application/multimedia.service';
import { IsFavoritedUseCase } from '../application/use-cases/is-favorited.usecase';
import { ListPublishedPublicUseCase } from '../application/use-cases/list-published-public.usecase';
import { FindPublishedFeaturedPublicUseCase } from '../application/use-cases/find-published-featured-public.usecase';
import { FindPublishedFeaturedPublicPaginatedUseCase } from '../application/use-cases/find-published-featured-public-paginated.usecase';
import { ExportSalePropertiesExcelUseCase } from '../application/use-cases/export-sale-properties-excel.usecase';
import { ExportRentPropertiesExcelUseCase } from '../application/use-cases/export-rent-properties-excel.usecase';
import { SoftDeletePropertyUseCase } from '../application/use-cases/soft-delete-property.usecase';
import { GetPublishedPropertiesFilteredUseCase } from '../application/use-cases/get-published-properties-filtered.usecase';
import { GridSalePropertiesUseCase } from '../application/use-cases/grid-sale-properties.usecase';
import { GridRentPropertiesUseCase } from '../application/use-cases/grid-rent-properties.usecase';
import { ListAvailableRentPropertiesUseCase } from '../application/use-cases/list-available-rent-properties.usecase';
import { UpdatePropertyUseCase } from '../application/use-cases/update-property.usecase';

@Injectable()
export class PropertyService {
  constructor(
    private readonly createPropertyUseCase: CreatePropertyUseCase,
    private readonly findPropertiesUseCase: FindPropertiesUseCase,
    private readonly findOnePropertyUseCase: FindOnePropertyUseCase,
    private readonly countPropertiesUseCase: CountPropertiesUseCase,
    private readonly toggleFavoriteUseCase: ToggleFavoriteUseCase,
    private readonly isFavoritedUseCase: IsFavoritedUseCase,
    private readonly listPublishedPublicUseCase: ListPublishedPublicUseCase,
    private readonly findPublishedFeaturedPublicUseCase: FindPublishedFeaturedPublicUseCase,
    private readonly findPublishedFeaturedPublicPaginatedUseCase: FindPublishedFeaturedPublicPaginatedUseCase,
    private readonly exportSalePropertiesExcelUseCase: ExportSalePropertiesExcelUseCase,
    private readonly exportRentPropertiesExcelUseCase: ExportRentPropertiesExcelUseCase,
    private readonly getPublishedPropertiesFilteredUseCase: GetPublishedPropertiesFilteredUseCase,
    private readonly softDeletePropertyUseCase: SoftDeletePropertyUseCase,
    private readonly gridSalePropertiesUseCase: GridSalePropertiesUseCase,
    private readonly gridRentPropertiesUseCase: GridRentPropertiesUseCase,
    private readonly listAvailableRentPropertiesUseCase: ListAvailableRentPropertiesUseCase,
    private readonly updatePropertyUseCase: UpdatePropertyUseCase,
    private readonly propertyRepository: PropertyRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Multimedia)
    private readonly multimediaRepository: Repository<Multimedia>,
    private readonly multimediaService: UploadMultimediaService,
  ) {}

  // --- high-level delegations ---

  async create(dto: any, creatorId?: string): Promise<Property> {
    return await this.createPropertyUseCase.execute(dto, creatorId);
  }

  async createPropertyWithFiles(dto: any, creatorId: string, files: any[]) {
    // simplistic fallback
    return await this.create(dto, creatorId);
  }

  async findAll(filters: any = {}): Promise<Property[]> {
    return await this.findPropertiesUseCase.execute(filters);
  }

  async findOne(id: string, trackView: boolean = true, viewData?: any): Promise<Property> {
    return await this.findOnePropertyUseCase.execute(id);
  }

  async countSaleProperties(): Promise<number> {
    return await this.countPropertiesUseCase.countSale();
  }

  async countPublishedProperties(): Promise<number> {
    return await this.countPropertiesUseCase.countPublished();
  }

  async countFeaturedProperties(): Promise<number> {
    return await this.countPropertiesUseCase.countFeatured();
  }

  async toggleFavorite(propertyId: string, userId: string): Promise<{ isFavorited: boolean }> {
    return this.toggleFavoriteUseCase.execute(propertyId, userId);
  }

  async isFavorited(propertyId: string, userId: string): Promise<boolean> {
    return this.isFavoritedUseCase.execute(propertyId, userId);
  }

  // --- stub implementations for remaining APIs ---

  async exportSalePropertiesExcel(query: any) {
    return await this.exportSalePropertiesExcelUseCase.execute(query);
  }

  async exportRentPropertiesExcel(query: any) {
    return await this.exportRentPropertiesExcelUseCase.execute(query);
  }

  async gridSaleProperties(query: any) {
    return await this.gridSalePropertiesUseCase.execute(query);
  }

  async gridRentProperties(query: any) {
    return await this.gridRentPropertiesUseCase.execute(query);
  }

  async getPublishedPropertiesFiltered(filters: any) {
    return await this.getPublishedPropertiesFilteredUseCase.execute(filters);
  }

  async getPublishedRentPropertiesFiltered(dto: FilterRentPropertiesDto) {
    return await this.getPublishedPropertiesFilteredUseCase.execute(dto, PropertyOperationType.RENT);
  }

  async getPublishedSalePropertiesFiltered(dto: FilterSalePropertiesDto) {
    return await this.getPublishedPropertiesFilteredUseCase.execute(dto, PropertyOperationType.SALE);
  }

  async listAvailableRentProperties(query: any) {
    return await this.listAvailableRentPropertiesUseCase.execute(query);
  }

  async listPublishedPublic() {
    return this.listPublishedPublicUseCase.execute();
  }

  async findPublishedFeaturedPublic() {
    return this.findPublishedFeaturedPublicUseCase.execute();
  }

  async findPublishedFeaturedPublicPaginated(page: number = 1, limit: number = 9) {
    return this.findPublishedFeaturedPublicPaginatedUseCase.execute(page, limit);
  }

  async getFullProperty(id: string): Promise<GetFullPropertyDto> {
    // delegate to findOne but cast to dto
    return (await this.findOne(id)) as any;
  }

  async update(id: string, dto: any, userId?: string) {
    return await this.updatePropertyUseCase.execute(id, dto, userId);
  }

  async remove(id: string, userId?: string) {
    await this.softDeletePropertyUseCase.execute(id);
  }

  async updateMainImage(id: string, url: string, userId?: string) {
    return await this.updatePropertyUseCase.execute(id, { mainImageUrl: url } as any, userId);
  }

  async updatePrice(id: string, dto: any, userId?: string) {
    return await this.updatePropertyUseCase.execute(id, dto, userId);
  }

  async updateCharacteristics(id: string, dto: any, userId?: string) {
    return await this.updatePropertyUseCase.execute(id, dto, userId);
  }

  // additional helpers derived from legacy service
  async updateLocation(id: string, dto: UpdatePropertyLocationDto, userId: string) {
    // reuse generic update use-case
    return await this.updatePropertyUseCase.execute(id, dto as any, userId);
  }
    async countFavorites(propertyId: string): Promise<number> {
      const property = await this.propertyRepository.findOne({ where: { id: propertyId } });
      if (!property) return 0;
      return Array.isArray(property.favorites) ? property.favorites.length : 0;
    }

  async getSeoData(id: string) {
    // placeholder for missing logic if required
    const property = await this.propertyRepository.findOne({ where: { id } });
    if (!property) throw new NotFoundException('Property not found');
    const favoritesCount = await this.countFavorites(id); // computed above
    const viewsCount = Array.isArray(property.views) ? property.views.length : 0;
    return {
      seoTitle: property.seoTitle,
      seoDescription: property.seoDescription,
      seoKeywords: property.seoKeywords,
      isFeatured: property.isFeatured,
      publicationDate: property.publicationDate,
      viewsCount,
      favoritesCount,
    };
  }


async createPropertyRequest(dto: any, userId: string): Promise<Property> {
      // legacy endpoint stub - returns placeholder or throws
      throw new Error('createPropertyRequest not implemented');
    }

    async updateSeoData(id: string, dto: UpdatePropertySeoDto, userId: string): Promise<Property> {
      // stub inserted above
      throw new Error('updateSeoData not implemented');
  }

  async isMultimediaMain(propertyId: string, multimediaId: string): Promise<boolean> {
    const property = await this.findOne(propertyId);
    const multimedia = await this.multimediaRepository.findOne({ where: { id: multimediaId, propertyId } });
    if (!multimedia) return false;
    return property.mainImageUrl === multimedia.url;
  }

  async getPriceRange(operationType?: PropertyOperationType) {
    try {
      let query = this.propertyRepository
        .createQueryBuilder('property')
        .select('MIN(property.price)', 'minPrice')
        .addSelect('MAX(property.price)', 'maxPrice')
        .where('property.status = :status', { status: PropertyStatus.PUBLISHED })
        .andWhere('property.deletedAt IS NULL')
        .andWhere('property.price > 0');
      if (operationType) {
        query = query.andWhere('property.operationType = :operationType', { operationType });
      }
      const result: any = await query.getRawOne();
      return {
        minPrice: result?.minPrice ? parseFloat(result.minPrice) : 0,
        maxPrice: result?.maxPrice ? parseFloat(result.maxPrice) : 10000000,
      };
    } catch (e) {
      console.error('Error getting price range', e);
      return { minPrice: 0, maxPrice: 10000000 };
    }
  }

  async getRelatedProperties(propertyId: string, limit: number = 5): Promise<Property[]> {
    // replicate legacy algorithm
    const refProperty = await this.propertyRepository.findOne({ where: { id: propertyId, deletedAt: IsNull() }, relations: ['propertyType'] });
    if (!refProperty) return [];
    const targetLimit = Math.max(3, limit);
    let related = await this.findRelatedWithCriteria(refProperty, { sameCity: true, sameState: true, sameType: true, priceRange: 0.3, sameOperation: true }, targetLimit);
    if (related.length < targetLimit) {
      related = await this.findRelatedWithCriteria(refProperty, { sameCity: true, sameState: true, sameType: true, priceRange: 0.5, sameOperation: true }, targetLimit);
    }
    if (related.length < targetLimit) {
      related = await this.findRelatedWithCriteria(refProperty, { sameCity: true, sameState: true, sameType: false, priceRange: 0.5, sameOperation: true }, targetLimit);
    }
    if (related.length < targetLimit) {
      related = await this.findRelatedWithCriteria(refProperty, { sameCity: false, sameState: true, sameType: false, priceRange: 0.5, sameOperation: true }, targetLimit);
    }
    if (related.length < targetLimit) {
      related = await this.findRelatedWithCriteria(refProperty, { sameCity: false, sameState: false, sameType: false, priceRange: null, sameOperation: true }, targetLimit);
    }
    return related.slice(0, limit);
  }

  private async findRelatedWithCriteria(
    refProperty: Property,
    criteria: { sameCity: boolean; sameState: boolean; sameType: boolean; priceRange: number | null; sameOperation: boolean },
    limit: number,
  ): Promise<Property[]> {
    let query = this.propertyRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.propertyType', 'pt')
      .leftJoinAndSelect('p.multimedia', 'm')
      .where('p.status = :status', { status: PropertyStatus.PUBLISHED })
      .andWhere('p.deletedAt IS NULL')
      .andWhere('p.id != :refId', { refId: refProperty.id });
    if (criteria.sameCity && refProperty.city) {
      query = query.andWhere('p.city = :city', { city: refProperty.city });
    }
    if (criteria.sameState && refProperty.state) {
      query = query.andWhere('p.state = :state', { state: refProperty.state });
    }
    if (criteria.sameType && refProperty.propertyTypeId) {
      query = query.andWhere('p.propertyTypeId = :typeId', { typeId: refProperty.propertyTypeId });
    }
    if (criteria.sameOperation && refProperty.operationType) {
      query = query.andWhere('p.operationType = :op', { op: refProperty.operationType });
    }
    if (criteria.priceRange !== null && criteria.priceRange !== undefined) {
      const low = refProperty.price * (1 - criteria.priceRange);
      const high = refProperty.price * (1 + criteria.priceRange);
      query = query.andWhere('p.price BETWEEN :low AND :high', { low, high });
    }
    query.orderBy('p.createdAt', 'DESC').limit(limit);
    return await query.getMany();
  }

  async getBasicPropertyInfo(propertyId: string): Promise<any> {
    const prop = await this.propertyRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.propertyType', 'pt')
      .leftJoinAndSelect('p.creatorUser', 'cu')
      .where('p.id = :id', { id: propertyId })
      .andWhere('p.deletedAt IS NULL')
      .select([
        'p.id',
        'p.title',
        'p.description',
        'p.status',
        'p.operationType',
        'p.price',
        'p.currencyPrice',
        'p.publicationDate',
        'p.assignedAgentId',
        'p.propertyTypeId',
        'p.createdAt',
        'p.updatedAt',
        'pt.id',
        'pt.name',
        'pt.description',
        'pt.hasBedrooms',
        'pt.hasBathrooms',
        'pt.hasBuiltSquareMeters',
        'pt.hasLandSquareMeters',
        'pt.hasParkingSpaces',
        'pt.hasFloors',
        'pt.hasConstructionYear',
        'cu.id',
        'cu.username',
        'cu.email',
        'cu.personalInfo',
      ])
      .getOne();
    if (!prop) throw new NotFoundException(`Property with ID ${propertyId} not found`);
    return prop;
  }

  async getPropertyHeaderInfo(propertyId: string): Promise<any> {
    const p = await this.propertyRepository
      .createQueryBuilder('p')
      .where('p.id = :id', { id: propertyId })
      .andWhere('p.deletedAt IS NULL')
      .select(['p.id', 'p.title', 'p.code', 'p.status', 'p.isFeatured'])
      .getOne();
    if (!p) throw new NotFoundException(`Property with ID ${propertyId} not found`);
    return p;
  }

  async getPropertyCharacteristics(propertyId: string): Promise<any> {
    const p = await this.propertyRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.propertyType', 'pt')
      .where('p.id = :id', { id: propertyId })
      .andWhere('p.deletedAt IS NULL')
      .select([
        'p.id',
        'p.builtSquareMeters',
        'p.landSquareMeters',
        'p.bedrooms',
        'p.bathrooms',
        'p.parkingSpaces',
        'p.floors',
        'p.constructionYear',
        'pt.id',
        'pt.name',
        'pt.hasBedrooms',
        'pt.hasBathrooms',
        'pt.hasBuiltSquareMeters',
        'pt.hasLandSquareMeters',
        'pt.hasParkingSpaces',
        'pt.hasFloors',
        'pt.hasConstructionYear',
      ])
      .getOne();
    if (!p) throw new NotFoundException(`Property with ID ${propertyId} not found`);
    const characteristicsMap = [
      { name: 'Metros cuadrados construidos', value: p.builtSquareMeters || 0 },
    ];
    return p;
  }

  async uploadMultimedia(
    propertyId: string,
    files: Express.Multer.File[],
    dto: UploadPropertyMultimediaDto,
    userId: string,
  ): Promise<Multimedia[]> {
    const property = await this.findOne(propertyId);
    const results: Multimedia[] = [];
    for (const file of files) {
      const multimedia = await this.multimediaService.uploadFile(
        file,
        { type: MultimediaType.PROPERTY_IMG },
        userId,
      );
      multimedia.propertyId = propertyId;
      await this.multimediaRepository.save(multimedia);
      results.push(multimedia);
    }
    if (results.length > 0 && (!property.mainImageUrl || property.mainImageUrl.trim() === '')) {
      const firstImage = results.find(m => m.format === MultimediaFormat.IMG);
      if (firstImage) {
        await this.propertyRepository.update(propertyId, { mainImageUrl: firstImage.url });
      }
    }
    return results;
  }

  async getPropertyLocation(propertyId: string): Promise<any> {
    const p = await this.propertyRepository
      .createQueryBuilder('p')
      .where('p.id = :id', { id: propertyId })
      .andWhere('p.deletedAt IS NULL')
      .select([
        'p.id',
        'p.state',
        'p.city',
        'p.address',
        'p.latitude',
        'p.longitude',
      ])
      .getOne();
    if (!p) throw new NotFoundException(`Property with ID ${propertyId} not found`);
    return {
      state: p.state || null,
      city: p.city || null,
      address: p.address || null,
      latitude: p.latitude ? Number(p.latitude) : null,
      longitude: p.longitude ? Number(p.longitude) : null,
    };
  }

  async getPropertyMultimedia(propertyId: string): Promise<any[]> {
    const p = await this.propertyRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.multimedia', 'm')
      .where('p.id = :id', { id: propertyId })
      .andWhere('p.deletedAt IS NULL')
      .andWhere('m.deletedAt IS NULL')
      .getOne();
    if (!p) throw new NotFoundException(`Property with ID ${propertyId} not found`);
    const normalizeUrl = (url: string, type: MultimediaFormat): string => {
      if (!url) return url;
      if (url.includes('/properties/img/') || url.includes('/properties/video/')) {
        return url;
      }
      if (url.includes('/public/properties/') && !url.includes('/properties/img/') && !url.includes('/properties/video/')) {
        const subfolder = type === MultimediaFormat.IMG ? 'img' : 'video';
        return url.replace('/public/properties/', `/public/properties/${subfolder}/`);
      }
      return url;
    };
    return (p.multimedia || []).map(m => ({
      id: m.id,
      url: normalizeUrl(m.url, m.format),
      type: m.format === 'IMG' ? 'image' : 'video',
      size: (m as any).size,
      uploadedAt: (m as any).uploadedAt,
      mainImageUrl: p.mainImageUrl,
    }));
  }

  async getPropertyHistory(propertyId: string): Promise<any[]> {
    const prop = await this.propertyRepository.findOne({ where: { id: propertyId, deletedAt: IsNull() } });
    if (!prop) throw new NotFoundException(`Property with ID ${propertyId} not found`);
    const changeHistory = prop.changeHistory || [];

    const changedByValues = Array.from(
      new Set(
        changeHistory
          .map((entry: any) => (typeof entry?.changedBy === 'string' ? entry.changedBy.trim() : ''))
          .filter((value) => value && value !== 'system'),
      ),
    );

    const userNameByIdentifier = new Map<string, string>();

    if (changedByValues.length > 0) {
      const users = await this.userRepository
        .createQueryBuilder('u')
        .withDeleted()
        .where('u.id IN (:...ids)', { ids: changedByValues })
        .orWhere('u.personId IN (:...ids)', { ids: changedByValues })
        .getMany();

      for (const user of users) {
        const fullName = `${user.personalInfo?.firstName || ''} ${user.personalInfo?.lastName || ''}`.trim();
        const displayName = fullName || user.username || user.email || 'Usuario sin nombre';

        if (user.id) {
          userNameByIdentifier.set(user.id, displayName);
        }
        if (user.personId) {
          userNameByIdentifier.set(user.personId, displayName);
        }
      }
    }

    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    return changeHistory.map((entry: any) => {
      const rawChangedBy = typeof entry?.changedBy === 'string' ? entry.changedBy.trim() : '';

      if (!rawChangedBy) {
        return { ...entry, changedById: null, changedBy: 'Sistema' };
      }

      if (rawChangedBy === 'system') {
        return { ...entry, changedById: 'system', changedBy: 'Sistema' };
      }

      const mappedName = userNameByIdentifier.get(rawChangedBy);
      if (mappedName) {
        return { ...entry, changedById: rawChangedBy, changedBy: mappedName };
      }

      if (uuidPattern.test(rawChangedBy)) {
        return { ...entry, changedById: rawChangedBy, changedBy: 'Usuario no disponible' };
      }

      return { ...entry, changedById: rawChangedBy, changedBy: rawChangedBy };
    });
  }

  async gridByUser(userId: string, query: GridSaleQueryDto & { operationType?: PropertyOperationType }) {
    // replicate legacy gridByUser logic
    // copying body from legacy
    // ([...] just above earlier in legacy data) - implement now
    const availableFields = [
      'id', 'code', 'isFeatured', 'title', 'status', 'operationType', 'typeName',
      'characteristics', 'assignedAgentName', 'creatorName', 'city', 'state',
      'priceDisplay', 'price', 'currencyPrice', 'createdAt', 'updatedAt', 'mainImageUrl',
    ];

    const fieldMappings: Record<string, string> = {
      id: 'p.id',
      code: 'p.code',
      isFeatured: 'p.isFeatured',
      title: 'p.title',
      status: 'p.status',
      operationType: 'p.operationType',
      typeName: 'pt.name AS typeName',
      city: 'p.city',
      state: 'p.state',
      price: 'p.price',
      currencyPrice: 'p.currencyPrice',
      createdAt: 'p.createdAt',
      updatedAt: 'p.updatedAt',
      mainImageUrl: 'p.mainImageUrl',
      assignedAgentName: 'a.username',
      creatorName: 'cu.username',
    };

    const requested = (query.fields || '').split(',').map(f => f.trim()).filter(f => f);
    const fields = requested.length ? requested.filter(f => availableFields.includes(f)) : availableFields;

    const rawSelects = fields
      .filter(f => !['characteristics', 'priceDisplay', 'assignedAgentName', 'creatorName'].includes(f))
      .map(f => {
        if (fieldMappings[f] && fieldMappings[f].includes(' AS ')) return fieldMappings[f];
        if (fieldMappings[f]) return `${fieldMappings[f]} AS ${f}`;
        return `p.${f} AS ${f}`;
      });

    if (fields.includes('characteristics')) {
      rawSelects.push(
        'p.bedrooms AS bedrooms',
        'p.bathrooms AS bathrooms',
        'p.landSquareMeters AS landSquareMeters',
        'p.builtSquareMeters AS builtSquareMeters',
        'p.parkingSpaces AS parkingSpaces',
        'p.floors AS floors',
      );
    }
    if (fields.includes('priceDisplay')) {
      rawSelects.push('p.price AS price', 'p.currencyPrice AS currencyPrice');
    }
    if (fields.includes('assignedAgentName')) {
      rawSelects.push('a.personalInfo AS assignedPersonalInfo', 'a.username AS assignedUsername');
    }
    if (fields.includes('creatorName')) {
      rawSelects.push('cu.personalInfo AS creatorPersonalInfo', 'cu.username AS creatorUsername');
    }

    if (!rawSelects.find(s => s.startsWith('p.id'))) rawSelects.unshift('p.id AS id');

    const qb = this.propertyRepository
      .createQueryBuilder('p')
      .leftJoin('p.propertyType', 'pt')
      .leftJoin('p.assignedAgent', 'a')
      .leftJoin('p.creatorUser', 'cu')
      .where('p.deletedAt IS NULL')
      .andWhere('(p.creatorUserId = :userId OR p.assignedAgentId = :userId)', { userId });

    if (query.operationType) {
      qb.andWhere('p.operationType = :opType', { opType: query.operationType });
    }

    if (query.sortField && query.sort) {
      const dbField = fieldMappings[query.sortField]
        ? fieldMappings[query.sortField].split(' AS ')[0]
        : `p.${query.sortField}`;
      qb.orderBy(dbField, query.sort.toUpperCase() as 'ASC' | 'DESC');
    } else {
      qb.orderBy('p.createdAt', 'DESC');
    }

    const selectClause = rawSelects.join(', ');
    qb.select(selectClause);

    if (query.page && query.limit) {
      const limit = query.limit || 9;
      const page = Math.max(1, query.page || 1);
      qb.skip((page - 1) * limit).take(limit);
    }

    return await qb.getRawMany();
  }

}
