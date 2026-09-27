import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { MultimediaModule } from '../multimedia/multimedia.module';
import { PortalHeader } from './domain/portal-header.entity';
import { PortalHeaderService } from './application/portal-header.service';
import { PortalHeaderController } from './presentation/portal-header.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PortalHeader]), AuthModule, AuditModule, MultimediaModule],
  controllers: [PortalHeaderController],
  providers: [PortalHeaderService],
  exports: [PortalHeaderService],
})
export class PortalHeaderModule {}
