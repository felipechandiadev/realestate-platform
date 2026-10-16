import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { Appearance } from './domain/appearance.entity';
import { AppearanceTemplate } from './domain/appearance-template.entity';
import { AppearanceService } from './application/appearance.service';
import { AppearanceController } from './presentation/appearance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Appearance, AppearanceTemplate]), AuthModule, AuditModule],
  controllers: [AppearanceController],
  providers: [AppearanceService],
  exports: [AppearanceService],
})
export class AppearanceModule {}
