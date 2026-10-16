import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { MultimediaModule } from '../multimedia/multimedia.module';
import { PortalFooter } from './domain/portal-footer.entity';
import { PortalFooterService } from './application/portal-footer.service';
import { PortalFooterController } from './presentation/portal-footer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PortalFooter]), AuthModule, AuditModule, MultimediaModule],
  controllers: [PortalFooterController],
  providers: [PortalFooterService],
  exports: [PortalFooterService],
})
export class PortalFooterModule {}
