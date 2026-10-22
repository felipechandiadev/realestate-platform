import { Body, Controller, Get, Patch, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Public } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { UserRole } from '../../users/domain/user.entity';
import { Audit, AuditInterceptor } from '../../../shared/interceptors/audit.interceptor';
import { AuditAction, AuditEntityType } from '../../../shared/enums/audit.enums';
import { PortalListingsSettingsService } from '../application/portal-listings-settings.service';

@Controller('portal-listings-settings')
@ApiTags('Portal listings settings')
@UseInterceptors(AuditInterceptor)
export class PortalListingsSettingsController {
  constructor(private readonly service: PortalListingsSettingsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Public portal listings filter variant' })
  @Audit(AuditAction.READ, AuditEntityType.PORTAL_LISTINGS, 'Portal listings settings retrieved')
  get() {
    return this.service.get();
  }

  @Patch()
  @ApiOperation({ summary: 'Update portal listings filter variant' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Audit(AuditAction.UPDATE, AuditEntityType.PORTAL_LISTINGS, 'Portal listings settings updated')
  update(@Body() body: { listingsFilterVariant?: string }) {
    return this.service.update(body ?? {});
  }
}
