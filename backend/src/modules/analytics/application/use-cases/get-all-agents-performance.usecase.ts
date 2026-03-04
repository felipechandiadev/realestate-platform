import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../../users/domain/user.entity';
import { AnalyticsFilters, AgentPerformance } from '../../domain/analytics.interface';
import { GetAgentPerformanceUseCase } from './get-agent-performance.usecase';

@Injectable()
export class GetAllAgentsPerformanceUseCase {
  private readonly logger = new Logger(GetAllAgentsPerformanceUseCase.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly getAgentPerformanceUseCase: GetAgentPerformanceUseCase,
  ) {}

  async execute(filters: AnalyticsFilters = {}): Promise<AgentPerformance[]> {
    const take = (filters as any).limit ?? 50;
    const skip = (filters as any).offset ?? 0;

    const agents = await this.userRepository.find({
      where: { role: UserRole.AGENT },
      take,
      skip,
      order: { createdAt: 'DESC' },
    });

    const performances: AgentPerformance[] = [];
    const period = this.getPeriodString(filters);

    for (const agent of agents) {
      try {
        const perf = await this.getAgentPerformanceUseCase.execute(agent.id, filters);
        performances.push(perf);
      } catch (error) {
        this.logger.error(`Error calculating metrics for agent ${agent.id}:`, error);
      }
    }

    return performances;
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
