import { Body, Controller, Get, Patch, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Public } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { UserRole } from '../../users/domain/user.entity';
import { Audit, AuditInterceptor } from '../../../shared/interceptors/audit.interceptor';
import { AuditAction, AuditEntityType } from '../../../shared/enums/audit.enums';
import { PortalFeaturedSettingsService } from '../application/portal-featured-settings.service';

@Controller('portal-featured-settings')
@ApiTags('Portal featured settings')
@UseInterceptors(AuditInterceptor)
export class PortalFeaturedSettingsController {
  constructor(private readonly service: PortalFeaturedSettingsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Public portal featured section settings' })
  @Audit(AuditAction.READ, AuditEntityType.PORTAL_FEATURED, 'Portal featured settings retrieved')
  get() {
    return this.service.get();
  }

  @Patch()
  @ApiOperation({ summary: 'Update portal featured section settings' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Audit(AuditAction.UPDATE, AuditEntityType.PORTAL_FEATURED, 'Portal featured settings updated')
  update(
    @Body()
    body: {
      layoutDesktop?: string;
      gridColumns?: number;
      gridRows?: number;
    },
  ) {
    return this.service.update(body ?? {});
  }
}
