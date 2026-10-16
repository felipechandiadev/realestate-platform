import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { PortalFeaturedSettings } from './domain/portal-featured-settings.entity';
import { PortalFeaturedSettingsService } from './application/portal-featured-settings.service';
import { PortalFeaturedSettingsController } from './presentation/portal-featured-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PortalFeaturedSettings]), AuthModule, AuditModule],
  controllers: [PortalFeaturedSettingsController],
  providers: [PortalFeaturedSettingsService],
  exports: [PortalFeaturedSettingsService],
})
export class PortalFeaturedModule {}
