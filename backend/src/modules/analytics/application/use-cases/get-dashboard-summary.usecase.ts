import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../../../property/domain/property.entity';
import { ContractRepository } from '../../../contracts/domain/contract.repository';
import { User, UserRole } from '../../../users/domain/user.entity';
import { Payment, PaymentStatus } from '../../../contracts/domain/payment.entity';
import { AnalyticsFilters } from '../../domain/analytics.interface';
import { GetAllAgentsPerformanceUseCase } from './get-all-agents-performance.usecase';

@Injectable()
export class GetDashboardSummaryUseCase {
  private readonly logger = new Logger(GetDashboardSummaryUseCase.name);

  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly contractRepository: ContractRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly getAllAgentsPerformanceUseCase: GetAllAgentsPerformanceUseCase,
  ) {}

  async execute(filters: AnalyticsFilters = {}): Promise<any> {
    const now = new Date();

    // Current month range
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Revenue (company recognized income) for current month (raw CLP and converted to millions)
    const totalRevenueThisMonthRaw = await this.getAgencyRevenueSum(startOfMonth, endOfMonth);
    const totalRevenueThisMonth = Math.round((totalRevenueThisMonthRaw / 1_000_000) * 10) / 10; // 1 decimal, millions

    // Count of agency-recognized payments in the same range (diagnostic)
    const agencyPaymentsCountThisMonth = await this.paymentRepository.createQueryBuilder('p')
      .select('COUNT(*)', 'count')
      .andWhere('p.status = :status', { status: PaymentStatus.PAID })
      .andWhere('p.isAgencyRevenue = true')
      .andWhere('COALESCE(p.paidAt, p.date) BETWEEN :start AND :end', { start: startOfMonth, end: endOfMonth })
      .getRawOne()
      .then(r => Number(r?.count || 0));

    // Revenue trend (last 6 months)
    const revenueTrend = await this.getRevenueTrend(6);

    // Active / published properties
    const activeProperties = await this.propertyRepository.createQueryBuilder('p')
      .where('p.status = :status', { status: 'PUBLISHED' })
      .andWhere('p.deletedAt IS NULL')
      .getCount();

    // New members this month (only COMMUNITY role)
    const newMembersThisMonth = await this.userRepository.createQueryBuilder('u')
      .where('u.createdAt BETWEEN :start AND :end', { start: startOfMonth, end: endOfMonth })
      .andWhere('u.role = :role', { role: UserRole.COMMUNITY })
      .getCount();

    // Average closure days (global, sales)
    const avgClosureDays = await this.getGlobalAverageClosureDays();

    // Property distribution by type
    const propertyDistribution = await this.getPropertyDistribution();

    // Agent ranking (delegate to separate use-case)
    const agentRanking = await this.getAllAgentsPerformanceUseCase.execute({ period: 'month' } as any);

    return {
      totalRevenueThisMonth,
      rawTotalRevenueThisMonth: totalRevenueThisMonthRaw,
      agencyPaymentsCountThisMonth,
      revenueTrend,
      activeProperties,
      newMembersThisMonth,
      avgClosureDays: Math.round(avgClosureDays * 100) / 100,
      propertyDistribution,
      agentRanking,
      period: this.getPeriodString(filters),
    };
  }

  // --- helpers pulled from former service ---
  private async getAgencyRevenueSum(start: Date, end: Date): Promise<number> {
    const qb = this.paymentRepository.createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .andWhere("p.status = :status", { status: PaymentStatus.PAID })
      .andWhere('p.isAgencyRevenue = true')
      .andWhere('COALESCE(p.paidAt, p.date) BETWEEN :start AND :end', { start, end });

    const res = await qb.getRawOne();
    return Number(res?.total || 0);
  }

  private async getRevenueTrend(months = 6): Promise<any[]> {
    const now = new Date();
    const trend: Array<{ month: string; amount: number }> = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const sum = await this.getAgencyRevenueSum(start, end);
      trend.push({
        month: start.toLocaleString('es-CL', { month: 'short', year: 'numeric' }),
        amount: Math.round((sum / 1_000_000) * 10) / 10, // millions, 1 decimal
      });
    }

    return trend;
  }

  private async getGlobalAverageClosureDays(): Promise<number> {
    const result = await this.contractRepository
      .createQueryBuilder('contract')
      .select('AVG(DATEDIFF(contract.updatedAt, contract.createdAt))', 'avgDays')
      .where('contract.status = :status', { status: 'CLOSED' })
      .andWhere('contract.deletedAt IS NULL')
      .getRawOne();

    return Number(result?.avgDays || 0);
  }

  private async getPropertyDistribution(): Promise<any[]> {
    const results = await this.propertyRepository
      .createQueryBuilder('property')
      .leftJoin('property.propertyType', 'pt')
      .select("COALESCE(pt.name, 'Otro')", 'type')
      .addSelect('COUNT(*)', 'count')
      .where('property.deletedAt IS NULL')
      .groupBy('pt.name')
      .getRawMany();

    const total = results.reduce((s, r) => s + Number(r.count), 0) || 1;

    return results.map(r => ({
      type: r.type,
      count: Number(r.count),
      percentage: Math.round((Number(r.count) / total) * 100),
    }));
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
