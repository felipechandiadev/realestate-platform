import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../../../property/domain/property.entity';
import { ContractRepository } from '../../../contracts/domain/contract.repository';
import { User, UserRole } from '../../../users/domain/user.entity';
import { Payment, PaymentStatus } from '../../../contracts/domain/payment.entity';
import { AnalyticsFilters } from '../../domain/analytics.interface';
import { GetAllAgentsPerformanceUseCase } from './get-all-agents-performance.usecase';
import { CONTRACT_CLOSURE_DAYS, PAYMENT_AMOUNT_CLP } from '../analytics-sql';
import { monthRange, percentChange, toMillions } from '../dashboard-math';

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
    const month = (offset: number, yearOffset = 0) => monthRange(now.getFullYear() + yearOffset, now.getMonth() + offset);
    const thisMonth = month(0);
    const lastMonth = month(-1);
    const sameMonthLastYear = month(0, -1);

    // Ingresos reconocidos por la corredora, en CLP (UF convertida con el valor del contrato).
    const [totalRevenueThisMonthRaw, revenueLastMonthRaw, revenueSameMonthLastYearRaw] = await Promise.all([
      this.getAgencyRevenueSum(thisMonth.start, thisMonth.end),
      this.getAgencyRevenueSum(lastMonth.start, lastMonth.end),
      this.getAgencyRevenueSum(sameMonthLastYear.start, sameMonthLastYear.end),
    ]);

    // Revenue trend (last 6 months)
    const revenueTrend = await this.getRevenueTrend(6);

    // Active / published properties
    const activeProperties = await this.propertyRepository.createQueryBuilder('p')
      .where('p.status = :status', { status: 'PUBLISHED' })
      .andWhere('p.deletedAt IS NULL')
      .getCount();

    // New members (only COMMUNITY role), this month and last month
    const [newMembersThisMonth, newMembersLastMonth] = await Promise.all(
      [thisMonth, lastMonth].map((range) =>
        this.userRepository.createQueryBuilder('u')
          .where('u.createdAt BETWEEN :start AND :end', range)
          .andWhere('u.role = :role', { role: UserRole.COMMUNITY })
          .getCount(),
      ),
    );

    // Average closure days (sales closed, creation → endDate)
    const avgClosureDays = await this.getGlobalAverageClosureDays();

    // Property distribution by type
    const propertyDistribution = await this.getPropertyDistribution();

    // Agent ranking (delegate to separate use-case)
    const agentRanking = await this.getAllAgentsPerformanceUseCase.execute({ period: 'month' } as any);

    return {
      totalRevenueThisMonth: toMillions(totalRevenueThisMonthRaw),
      rawTotalRevenueThisMonth: totalRevenueThisMonthRaw,
      previousYearSameMonth: toMillions(revenueSameMonthLastYearRaw),
      revenueTrend,
      activeProperties,
      newMembersThisMonth,
      avgClosureDays: Math.round(avgClosureDays * 100) / 100,
      // Variación % contra el mes anterior; null cuando no hay base para comparar.
      variations: {
        revenue: percentChange(totalRevenueThisMonthRaw, revenueLastMonthRaw),
        newMembers: percentChange(newMembersThisMonth, newMembersLastMonth),
      },
      propertyDistribution,
      agentRanking,
      period: this.getPeriodString(filters),
    };
  }

  // --- helpers pulled from former service ---
  private async getAgencyRevenueSum(start: Date, end: Date): Promise<number> {
    const qb = this.paymentRepository.createQueryBuilder('p')
      .leftJoin('p.contract', 'c')
      .select(`SUM(${PAYMENT_AMOUNT_CLP})`, 'total')
      .andWhere("p.status = :status", { status: PaymentStatus.PAID })
      .andWhere('p.isAgencyRevenue = true')
      .andWhere('COALESCE(p.paidAt, p.date) BETWEEN :start AND :end', { start, end });

    const res = await qb.getRawOne();
    return Math.round(Number(res?.total || 0));
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
        amount: toMillions(sum),
      });
    }

    return trend;
  }

  private async getGlobalAverageClosureDays(): Promise<number> {
    const result = await this.contractRepository
      .createQueryBuilder('contract')
      .select(`AVG(${CONTRACT_CLOSURE_DAYS})`, 'avgDays')
      .where('contract.status = :status', { status: 'CLOSED' })
      .andWhere('contract.operation = :operation', { operation: 'COMPRAVENTA' })
      .andWhere('contract.endDate IS NOT NULL')
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
