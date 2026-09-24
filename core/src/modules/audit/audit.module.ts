import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './application/audit.service';
import { AuditController } from './presentation/audit.controller';
import { AuditLog } from './domain/audit-log.entity';
import { AuditInterceptor } from '../../shared/interceptors/audit.interceptor';
import { JweModule } from '../auth/jwe/jwe.module';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog]), JweModule],
  controllers: [AuditController],
  providers: [AuditService, AuditInterceptor],
  exports: [AuditService, AuditInterceptor],
})
export class AuditModule {}
