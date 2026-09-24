import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../../users/domain/user.entity';
import { Property } from '../../../property/domain/property.entity';
import { ContractRepository } from '../../../contracts/domain/contract.repository';
import { ContractOperationType, ContractStatus } from '../../../contracts/domain/contract.entity';
import { AnalyticsFilters, AgentPerformance, AgentPerformanceMetrics } from '../../domain/analytics.interface';

@Injectable()
export class GetAgentPerformanceUseCase {
  private readonly logger = new Logger(GetAgentPerformanceUseCase.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly contractRepository: ContractRepository,
  ) {}

  async execute(agentId: string, filters: AnalyticsFilters = {}): Promise<AgentPerformance> {
    const agent = await this.userRepository.findOne({
      where: { id: agentId, role: UserRole.AGENT },
    });

    if (!agent) {
      throw new Error(`Agent with ID ${agentId} not found`);
    }

    const metrics = await this.calculateAgentMetrics(agentId, filters);
    const period = this.getPeriodString(filters);

    return {
      agentId,
      agentName: agent.name,
      period,
      metrics,
    };
  }

  // copied helpers from original service
  private async calculateAgentMetrics(
    agentId: string,
    filters: AnalyticsFilters,
  ): Promise<AgentPerformanceMetrics> {
    const dateRange = this.getDateRange(filters);

    // Get assigned properties count
    const assignedProperties = await this.getAssignedPropertiesCount(agentId, dateRange);

    // Get closed contracts count
    const closedContracts = await this.getClosedContractsCount(agentId, dateRange, filters.operationType);

    // Calculate conversion rate
    const conversionRate = assignedProperties > 0 ? (closedContracts / assignedProperties) * 100 : 0;

    // Get total contract value
    const totalContractValue = await this.getTotalContractValue(agentId, dateRange, filters.operationType);

    // Get average closure days
    const avgClosureDays = await this.getAverageClosureDays(agentId, dateRange, filters.operationType);

    // Get properties by status
    const propertiesByStatus = await this.getPropertiesByStatus(agentId, dateRange);

    // Get contracts by operation
    const contractsByOperation = await this.getContractsByOperation(agentId, dateRange);

    return {
      assignedProperties,
      closedContracts,
      conversionRate: Math.round(conversionRate * 100) / 100, // Round to 2 decimal places
      totalContractValue,
      avgClosureDays: Math.round(avgClosureDays * 100) / 100, // Round to 2 decimal places
      propertiesByStatus,
      contractsByOperation,
    };
  }

  private async getAssignedPropertiesCount(
    agentId: string,
    dateRange?: { start: Date; end: Date },
  ): Promise<number> {
    const query = this.propertyRepository
      .createQueryBuilder('property')
      .where('property.assignedAgentId = :agentId', { agentId })
      .andWhere('property.deletedAt IS NULL');

    if (dateRange) {
      query.andWhere('property.createdAt BETWEEN :start AND :end', {
        start: dateRange.start,
        end: dateRange.end,
      });
    }

    return await query.getCount();
  }

  private async getClosedContractsCount(
    agentId: string,
    dateRange?: { start: Date; end: Date },
    operationType?: 'SALE' | 'RENT',
  ): Promise<number> {
    const query = this.contractRepository
      .createQueryBuilder('contract')
      .innerJoin('contract.property', 'property')
      .where('property.assignedAgentId = :agentId', { agentId })
      .andWhere('contract.status = :status', { status: ContractStatus.CLOSED })
      .andWhere('contract.deletedAt IS NULL')
      .andWhere('property.deletedAt IS NULL');

    if (dateRange) {
      query.andWhere('contract.createdAt BETWEEN :start AND :end', {
        start: dateRange.start,
        end: dateRange.end,
      });
    }

    if (operationType) {
      const contractOp =
        operationType === 'SALE' ? ContractOperationType.COMPRAVENTA : ContractOperationType.ARRIENDO;
      query.andWhere('contract.operation = :operation', { operation: contractOp });
    }

    return await query.getCount();
  }

  private async getTotalContractValue(
    agentId: string,
    dateRange?: { start: Date; end: Date },
    operationType?: 'SALE' | 'RENT',
  ): Promise<number> {
    const query = this.contractRepository
      .createQueryBuilder('contract')
      .innerJoin('contract.property', 'property')
      .select('SUM(contract.amount)', 'total')
      .where('property.assignedAgentId = :agentId', { agentId });

    if (dateRange) {
      query.andWhere('contract.createdAt BETWEEN :start AND :end', {
        start: dateRange.start,
        end: dateRange.end,
      });
    }

    if (operationType) {
      const contractOp =
        operationType === 'SALE' ? ContractOperationType.COMPRAVENTA : ContractOperationType.ARRIENDO;
      query.andWhere('contract.operation = :operation', { operation: contractOp });
    }

    const res: any = await query.getRawOne();
    return Number(res?.total || 0);
  }

  private async getAverageClosureDays(
    agentId: string,
    dateRange?: { start: Date; end: Date },
    operationType?: 'SALE' | 'RENT',
  ): Promise<number> {
    const query = this.contractRepository
      .createQueryBuilder('contract')
      .innerJoin('contract.property', 'property')
      .select('AVG(DATEDIFF(contract.updatedAt, contract.createdAt))', 'avgDays')
      .where('property.assignedAgentId = :agentId', { agentId })
      .andWhere('contract.status = :status', { status: ContractStatus.CLOSED })
      .andWhere('contract.deletedAt IS NULL')
      .andWhere('property.deletedAt IS NULL');

    if (dateRange) {
      query.andWhere('contract.createdAt BETWEEN :start AND :end', {
        start: dateRange.start,
        end: dateRange.end,
      });
    }

    if (operationType) {
      const contractOp =
        operationType === 'SALE' ? ContractOperationType.COMPRAVENTA : ContractOperationType.ARRIENDO;
      query.andWhere('contract.operation = :operation', { operation: contractOp });
    }

    const res: any = await query.getRawOne();
    return Number(res?.avgDays || 0);
  }

  private async getPropertiesByStatus(
    agentId: string,
    dateRange?: { start: Date; end: Date },
  ): Promise<any> {
    const query = this.propertyRepository
      .createQueryBuilder('property')
      .select('property.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('property.assignedAgentId = :agentId', { agentId })
      .andWhere('property.deletedAt IS NULL');

    if (dateRange) {
      query.andWhere('property.createdAt BETWEEN :start AND :end', {
        start: dateRange.start,
        end: dateRange.end,
      });
    }

    query.groupBy('property.status');

    const results = await query.getRawMany();
    const statusCounts: any = {};
    results.forEach(r => {
      statusCounts[r.status] = parseInt(r.count, 10);
    });
    return statusCounts;
  }

  private async getContractsByOperation(
    agentId: string,
    dateRange?: { start: Date; end: Date },
  ): Promise<any> {
    const query = this.contractRepository
      .createQueryBuilder('contract')
      .select('contract.operation', 'operation')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('contract.property', 'property')
      .where('property.assignedAgentId = :agentId', { agentId })
      .andWhere('contract.deletedAt IS NULL')
      .andWhere('property.deletedAt IS NULL');

    if (dateRange) {
      query.andWhere('contract.createdAt BETWEEN :start AND :end', {
        start: dateRange.start,
        end: dateRange.end,
      });
    }

    const results = await query.getRawMany();
    const opCounts: any = { sale: 0, rent: 0 };
    results.forEach(r => {
      if (r.operation === ContractOperationType.COMPRAVENTA) {
        opCounts.sale = parseInt(r.count, 10);
      } else if (r.operation === ContractOperationType.ARRIENDO) {
        opCounts.rent = parseInt(r.count, 10);
      }
    });
    return opCounts;
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
