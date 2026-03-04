import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNull } from 'typeorm';
import { Property } from '../../domain/property.entity';
import { PropertyRepository } from '../../domain/property.repository';
import { UpdatePropertyDto } from '../../dto/property.dto';
import { PropertyStatus } from '../../../../shared/enums/property-status.enum';
import { PropertyType } from '../../../property-types/domain/property-type.entity';
import { User } from '../../../users/domain/user.entity';
import { NotificationsService } from '../../../notifications/application/notifications.service';

@Injectable()
export class UpdatePropertyUseCase {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
    updatedBy?: string,
  ): Promise<Property> {
    const property = await this.propertyRepository.findOne({ where: { id, deletedAt: IsNull() } });
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    const oldAssignedAgentId = property.assignedAgentId;
    const oldStatus = property.status;

    // Filter blank values
    const cleanDto = Object.fromEntries(
      Object.entries(updatePropertyDto).filter(([, value]) =>
        value !== '' && value !== null && value !== undefined,
      ),
    ) as UpdatePropertyDto;

    // simple validation placeholder (could be extracted to helper)
    // ...

    const changes: Array<{
      timestamp: Date;
      changedBy: string;
      field: string;
      previousValue: any;
      newValue: any;
    }> = [];

    for (const [key, newValue] of Object.entries(cleanDto)) {
      if (newValue === undefined) continue;
      const currentValue = property[key];
      let hasChanged = false;
      if (currentValue !== newValue) {
        if ((currentValue == null && newValue != null) ||
            (currentValue != null && newValue == null)) {
          hasChanged = true;
        } else if (typeof currentValue !== typeof newValue) {
          hasChanged = true;
        } else if (typeof newValue === 'boolean') {
          hasChanged = Boolean(currentValue) !== Boolean(newValue);
        } else if (typeof newValue === 'string') {
          hasChanged = String(currentValue || '').trim() !== String(newValue).trim();
        } else if (typeof newValue === 'number') {
          hasChanged = Number(currentValue || 0) !== Number(newValue);
        } else {
          hasChanged = currentValue !== newValue;
        }
      }
      if (hasChanged) {
        changes.push({
          timestamp: new Date(),
          changedBy: updatedBy || 'system',
          field: key,
          previousValue: currentValue,
          newValue: newValue,
        });
      }
    }

    if (cleanDto.propertyTypeId) {
      const propertyType = await this.propertyRepository.manager.findOne(PropertyType, {
        where: { id: cleanDto.propertyTypeId, deletedAt: IsNull() },
      });
      if (propertyType) {
        property.propertyType = propertyType;
      }
    }

    Object.assign(property, cleanDto);
    if (cleanDto.status === PropertyStatus.PUBLISHED && !property.publishedAt) {
      property.publishedAt = new Date();
    }
    property.lastModifiedAt = new Date();
    if (changes.length > 0) {
      property.changeHistory = [...(property.changeHistory || []), ...changes];
    }

    const savedProperty = await this.propertyRepository.save(property);
    const reloadedProperty = await this.propertyRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.propertyType', 'pt')
      .leftJoinAndSelect('p.creatorUser', 'cu')
      .leftJoinAndSelect('p.assignedAgent', 'aa')
      .where('p.id = :id', { id: savedProperty.id })
      .andWhere('p.deletedAt IS NULL')
      .getOne();

    if (!reloadedProperty) {
      return savedProperty;
    }

    // notifications
    if (cleanDto.assignedAgentId && oldAssignedAgentId !== cleanDto.assignedAgentId) {
      const agent = await this.propertyRepository.manager.findOne(User, { where: { id: cleanDto.assignedAgentId } });
      if (agent) await this.notificationsService.notifyAgentAssigned(reloadedProperty, agent);
    }
    if (cleanDto.status && oldStatus !== cleanDto.status) {
      await this.notificationsService.notifyPropertyStatusChange(reloadedProperty, oldStatus, cleanDto.status as any);
    }

    return reloadedProperty;
  }
}
