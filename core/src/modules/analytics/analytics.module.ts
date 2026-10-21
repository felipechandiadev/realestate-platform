import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './presentation/analytics.controller';
import { AnalyticsService } from './application/analytics.service';
import { GetDashboardSummaryUseCase } from './application/use-cases/get-dashboard-summary.usecase';
import { GetAgentPerformanceUseCase } from './application/use-cases/get-agent-performance.usecase';
import { GetAllAgentsPerformanceUseCase } from './application/use-cases/get-all-agents-performance.usecase';
import { GetGeographicAnalyticsUseCase } from './application/use-cases/get-geographic-analytics.usecase';
import { Property } from '../property/domain/property.entity';
import { User } from '../users/domain/user.entity';
import { Payment } from '../contracts/domain/payment.entity';
import { ContractsModule } from '../contracts/contracts.module';
import { ContractOrmEntity } from '../contracts/infrastructure/persistence/contract.orm-entity';
import { GetAdminReportUseCase } from './application/use-cases/get-admin-report.usecase';

@Module({
  imports: [
    // Add repositories required by analytics (contracts comes via ContractsModule)
    TypeOrmModule.forFeature([Property, User, Payment, ContractOrmEntity]),
    ContractsModule,
  ],
  controllers: [AnalyticsController],
  providers: [
    GetDashboardSummaryUseCase,
    GetAgentPerformanceUseCase,
    GetAllAgentsPerformanceUseCase,
    GetGeographicAnalyticsUseCase,
    GetAdminReportUseCase,
    AnalyticsService,
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}