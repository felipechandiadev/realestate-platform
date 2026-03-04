import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../../../property/domain/property.entity';
import { ContractRepository } from '../../../contracts/domain/contract.repository';
import { ContractOperationType, ContractStatus } from '../../../contracts/domain/contract.entity';
import { AnalyticsFilters, GeographicAnalytics } from '../../domain/analytics.interface';

@Injectable()
export class GetGeographicAnalyticsUseCase {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly contractRepository: ContractRepository,
  ) {}

  async execute(filters: AnalyticsFilters = {}): Promise<GeographicAnalytics> {
    const dateRange = this.getDateRange(filters);
    const period = this.getPeriodString(filters);

    // Get efficiency by region
    const efficiencyByRegion = await this.getEfficiencyByRegion(dateRange, filters.operationType);

    // Get efficiency by commune
    const efficiencyByCommune = await this.getEfficiencyByCommune(dateRange, filters.operationType);

    // Get top and lowest performing regions
    const sortedByConversion = [...efficiencyByRegion].sort((a, b) => b.conversionRate - a.conversionRate);
    const topPerformingRegions = sortedByConversion.slice(0, 5);
    const lowestPerformingRegions = sortedByConversion.slice(-5).reverse();

    return {
      period,
      totalRegions: efficiencyByRegion.length,
      totalCommunes: efficiencyByCommune.length,
      efficiencyByRegion,
      efficiencyByCommune,
      topPerformingRegions,
      lowestPerformingRegions,
    };
  }

  // helper methods coming from original service
  private async getEfficiencyByRegion(
    dateRange?: { start: Date; end: Date },
    operationType?: 'SALE' | 'RENT',
  ): Promise<any[]> {
    const query = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoin('property.state', 'region')
      .leftJoin('property.city', 'commune')
      .select([
        'region.name as region',
        'COUNT(DISTINCT property.id) as assignedProperties',
        "COUNT(DISTINCT CASE WHEN contract.id IS NOT NULL AND contract.status = :contractStatus THEN contract.id END) as closedContracts",
        "AVG(CASE WHEN contract.id IS NOT NULL AND contract.status = :contractStatus THEN DATEDIFF(contract.updatedAt, contract.createdAt) END) as avgClosureDays",
        "SUM(CASE WHEN contract.id IS NOT NULL AND contract.status = :contractStatus THEN contract.amount END) as totalContractValue"
      ])
      .leftJoin('contract', 'contract', 'contract.propertyId = property.id')
      .where('property.deletedAt IS NULL')
      .andWhere('region.name IS NOT NULL')
      .setParameters({ contractStatus: ContractStatus.CLOSED })
      .groupBy('region.name')
      .orderBy('region.name');

    if (dateRange) {
      query.andWhere('property.createdAt BETWEEN :start AND :end', {
        start: dateRange.start,
        end: dateRange.end,
      });
    }

    if (operationType) {
      const contractOp = operationType === 'SALE' ? ContractOperationType.COMPRAVENTA : ContractOperationType.ARRIENDO;
      query.andWhere('contract.operation = :operation', { operation: contractOp });
    }

    const results = await query.getRawMany();

    // Calculate conversion rates and get properties by status for each region
    for (const result of results) {
      const conversionRate = result.assignedProperties > 0 ? (result.closedContracts / result.assignedProperties) * 100 : 0;
      result.conversionRate = Math.round(conversionRate * 100) / 100;
      result.avgClosureDays = result.avgClosureDays || 0;
      result.totalContractValue = result.totalContractValue || 0;

      result.propertiesByStatus = await this.getPropertiesByStatusForLocation(
        { region: result.region },
        dateRange,
      );
    }

    return results;
  }

  private async getEfficiencyByCommune(
    dateRange?: { start: Date; end: Date },
    operationType?: 'SALE' | 'RENT',
  ): Promise<any[]> {
    const query = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoin('property.state', 'region')
      .leftJoin('property.city', 'commune')
      .select([
        'region.name as region',
        'commune.name as commune',
        'COUNT(DISTINCT property.id) as assignedProperties',
        "COUNT(DISTINCT CASE WHEN contract.id IS NOT NULL AND contract.status = :contractStatus THEN contract.id END) as closedContracts",
        "AVG(CASE WHEN contract.id IS NOT NULL AND contract.status = :contractStatus THEN DATEDIFF(contract.updatedAt, contract.createdAt) END) as avgClosureDays",
        "SUM(CASE WHEN contract.id IS NOT NULL AND contract.status = :contractStatus THEN contract.amount END) as totalContractValue"
      ])
      .leftJoin('contract', 'contract', 'contract.propertyId = property.id')
      .where('property.deletedAt IS NULL')
      .andWhere('commune.name IS NOT NULL')
      .setParameters({ contractStatus: ContractStatus.CLOSED })
      .groupBy('region.name, commune.name')
      .orderBy('region.name, commune.name');

    if (dateRange) {
      query.andWhere('property.createdAt BETWEEN :start AND :end', {
        start: dateRange.start,
        end: dateRange.end,
      });
    }

    if (operationType) {
      const contractOp = operationType === 'SALE' ? ContractOperationType.COMPRAVENTA : ContractOperationType.ARRIENDO;
      query.andWhere('contract.operation = :operation', { operation: contractOp });
    }

    const results = await query.getRawMany();

    for (const result of results) {
      const conversionRate = result.assignedProperties > 0 ? (result.closedContracts / result.assignedProperties) * 100 : 0;
      result.conversionRate = Math.round(conversionRate * 100) / 100;
      result.avgClosureDays = result.avgClosureDays || 0;
      result.totalContractValue = result.totalContractValue || 0;

      result.propertiesByStatus = await this.getPropertiesByStatusForLocation(
        { region: result.region, commune: result.commune },
        dateRange,
      );
    }

    return results;
  }

  private async getPropertiesByStatusForLocation(
    location: { region?: string; commune?: string },
    dateRange?: { start: Date; end: Date },
  ): Promise<any> {
    const query = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoin('property.state', 'region')
      .leftJoin('property.city', 'commune')
      .select('property.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('property.deletedAt IS NULL');

    if (location.region) {
      query.andWhere('region.name = :region', { region: location.region });
    }
    if (location.commune) {
      query.andWhere('commune.name = :commune', { commune: location.commune });
    }

    if (dateRange) {
      query.andWhere('property.createdAt BETWEEN :start AND :end', {
        start: dateRange.start,
        end: dateRange.end,
      });
    }

    query.groupBy('property.status');

    const results = await query.getRawMany();

    const statusCounts: any = {
      REQUEST: 0,
      PRE_APPROVED: 0,
      PUBLISHED: 0,
      INACTIVE: 0,
      SOLD: 0,
      RENTED: 0,
    };

    results.forEach(result => {
      statusCounts[result.status] = parseInt(result.count, 10);
    });

    return statusCounts;
  }

  private getDateRange(filters: AnalyticsFilters): { start: Date; end: Date } | undefined {
    if (filters.startDate && filters.endDate) {
      return { start: filters.startDate, end: filters.endDate };
    }

    if (filters.period) {
      const now = new Date();
      const start = new Date();

      switch (filters.period) {
        case 'month':
          start.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          start.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          start.setFullYear(now.getFullYear() - 1);
          break;
        case 'all':
          return undefined;
      }

      return { start, end: now };
    }

    return undefined;
  }

  private getPeriodString(filters: AnalyticsFilters): string {
    if (filters.startDate && filters.endDate) {
      return `${filters.startDate.toISOString().split('T')[0]} to ${filters.endDate.toISOString().split('T')[0]}`;
    }

    if (filters.period) {
      return `Last ${filters.period}`;
    }

    return 'All time';
  }
}
