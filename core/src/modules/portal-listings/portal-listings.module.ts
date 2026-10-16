import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { PortalListingsSettings } from './domain/portal-listings-settings.entity';
import { PortalListingsSettingsService } from './application/portal-listings-settings.service';
import { PortalListingsSettingsController } from './presentation/portal-listings-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PortalListingsSettings]), AuthModule, AuditModule],
  controllers: [PortalListingsSettingsController],
  providers: [PortalListingsSettingsService],
  exports: [PortalListingsSettingsService],
})
export class PortalListingsModule {}
