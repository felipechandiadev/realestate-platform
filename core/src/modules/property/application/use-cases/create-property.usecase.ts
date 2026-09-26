import { Injectable, BadRequestException } from '@nestjs/common';
import { ChangeHistoryEntry } from '../../../../shared/interfaces/property.interfaces';
import { Property } from '../../domain/property.entity';
import { PropertyRepository } from '../../domain/property.repository';
import { CreatePropertyDto } from '../../dto/property.dto';
import { PropertyStatus } from '../../../../shared/enums/property-status.enum';
import { PropertyOperationType } from '../../../../shared/enums/property-operation-type.enum';

@Injectable()
export class CreatePropertyUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  private async generatePropertyCode(
    operationType: PropertyOperationType,
  ): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    const prefix =
      operationType === PropertyOperationType.SALE ? 'PV' : 'PA';

    const existing = await this.propertyRepository
      .createQueryBuilder('property')
      .withDeleted()
      .select(['property.id', 'property.code'])
      .where('property.code LIKE :pattern', { pattern: `${prefix}-${year}-%` })
      .getMany();

    let sequence = 1;
    for (const property of existing) {
      const parts = property.code?.split('-') ?? [];
      if (parts.length !== 3) continue;
      const value = parseInt(parts[2], 10);
      if (!Number.isNaN(value) && value + 1 > sequence) {
        sequence = value + 1;
      }
    }

    const sequenceStr = sequence.toString().padStart(7, '0');
    return `${prefix}-${year}-${sequenceStr}`;
  }

  private validatePropertyData(dto: CreatePropertyDto) {
    if (!dto.title || dto.title.trim() === '') {
      throw new BadRequestException('Title is required');
    }
    // additional business validations can be added here
  }

  async execute(
    createPropertyDto: CreatePropertyDto,
    creatorId?: string,
  ): Promise<Property> {
    this.validatePropertyData(createPropertyDto);

    const code = await this.generatePropertyCode(
      createPropertyDto.operationType,
    );

    const property = this.propertyRepository.create({
      ...createPropertyDto,
      code,
      description: createPropertyDto.description ?? undefined,
      address: createPropertyDto.address ?? undefined,
      latitude:
        createPropertyDto.latitude ??
        (createPropertyDto as any).location?.lat ??
        undefined,
      longitude:
        createPropertyDto.longitude ??
        (createPropertyDto as any).location?.lng ??
        undefined,
      creatorUserId:
        creatorId && creatorId !== 'anonymous'
          ? creatorId
          : createPropertyDto.creatorUserId,
      propertyTypeId:
        (createPropertyDto as any).propertyTypeId ||
        (createPropertyDto as any).propertyType ||
        undefined,
      status: createPropertyDto.status || PropertyStatus.REQUEST,
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    });

    const historyEntry: ChangeHistoryEntry = {
      timestamp: new Date(),
      changedBy: creatorId || 'system',
      field: 'creation',
      previousValue: null,
      newValue: 'Created',
    };

    property.changeHistory = [historyEntry];

    return await this.propertyRepository.save(property);
  }
}
