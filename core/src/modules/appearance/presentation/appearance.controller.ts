import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { UserRole } from '../../users/domain/user.entity';
import { Audit, AuditInterceptor } from '../../../shared/interceptors/audit.interceptor';
import { AuditAction, AuditEntityType } from '../../../shared/enums/audit.enums';
import { AppearanceService } from '../application/appearance.service';

@Controller('appearance')
@ApiTags('Appearance')
@UseInterceptors(AuditInterceptor)
export class AppearanceController {
  constructor(private readonly appearanceService: AppearanceService) {}

  @Get()
  @ApiOperation({ summary: 'Public brand appearance colors' })
  @Audit(AuditAction.READ, AuditEntityType.APPEARANCE, 'Appearance retrieved')
  get() {
    return this.appearanceService.get();
  }

  @Patch()
  @ApiOperation({ summary: 'Update brand appearance colors' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Audit(AuditAction.UPDATE, AuditEntityType.APPEARANCE, 'Appearance updated')
  update(@Body() body: Record<string, unknown>) {
    return this.appearanceService.update(body ?? {});
  }

  @Get('templates')
  @ApiOperation({ summary: 'List appearance templates' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Audit(AuditAction.READ, AuditEntityType.APPEARANCE, 'Appearance templates retrieved')
  listTemplates() {
    return this.appearanceService.listTemplates();
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create an appearance template' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Audit(AuditAction.CREATE, AuditEntityType.APPEARANCE, 'Appearance template created')
  createTemplate(@Body() body: Record<string, unknown>) {
    return this.appearanceService.createTemplate(body ?? {});
  }

  @Patch('templates/:id')
  @ApiOperation({ summary: 'Rename an appearance template' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Audit(AuditAction.UPDATE, AuditEntityType.APPEARANCE, 'Appearance template renamed')
  renameTemplate(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.appearanceService.renameTemplate(id, body ?? {});
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete an appearance template' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Audit(AuditAction.DELETE, AuditEntityType.APPEARANCE, 'Appearance template deleted')
  deleteTemplate(@Param('id') id: string) {
    return this.appearanceService.deleteTemplate(id);
  }
}
