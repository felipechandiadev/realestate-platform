import { Injectable } from '@nestjs/common';
import { AnalyticsFilters } from '../domain/analytics.interface';
import { GetDashboardSummaryUseCase } from './use-cases/get-dashboard-summary.usecase';
import { GetAgentPerformanceUseCase } from './use-cases/get-agent-performance.usecase';
import { GetAllAgentsPerformanceUseCase } from './use-cases/get-all-agents-performance.usecase';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase,
    private readonly getAgentPerformanceUseCase: GetAgentPerformanceUseCase,
    private readonly getAllAgentsPerformanceUseCase: GetAllAgentsPerformanceUseCase,
  ) {}

  async getDashboardSummary(filters: AnalyticsFilters = {}) {
    return this.getDashboardSummaryUseCase.execute(filters);
  }

  async getAgentPerformance(agentId: string, filters: AnalyticsFilters = {}) {
    return this.getAgentPerformanceUseCase.execute(agentId, filters);
  }

  async getAllAgentsPerformance(filters: AnalyticsFilters = {}) {
    return this.getAllAgentsPerformanceUseCase.execute(filters);
  }

}
