import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Patch,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Public } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { UserRole } from '../../users/domain/user.entity';
import { Audit, AuditInterceptor } from '../../../shared/interceptors/audit.interceptor';
import { AuditAction, AuditEntityType } from '../../../shared/enums/audit.enums';
import { PortalFooterService } from '../application/portal-footer.service';

@Injectable()
export class ParsePortalFooterJsonInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const body = context.switchToHttp().getRequest().body ?? {};
    if (typeof body.menuItems === 'string') {
      try {
        body.menuItems = JSON.parse(body.menuItems);
      } catch {
        throw new BadRequestException('JSON inválido en menuItems');
      }
    }
    return next.handle();
  }
}

@Controller('portal-footer')
@ApiTags('Portal footer')
@UseInterceptors(AuditInterceptor)
export class PortalFooterController {
  constructor(private readonly portalFooterService: PortalFooterService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Public portal footer configuration' })
  @Audit(AuditAction.READ, AuditEntityType.PORTAL_FOOTER, 'Portal footer retrieved')
  get() {
    return this.portalFooterService.get();
  }

  @Patch()
  @ApiOperation({ summary: 'Update portal footer' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Audit(AuditAction.UPDATE, AuditEntityType.PORTAL_FOOTER, 'Portal footer updated')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'logo', maxCount: 1 }]),
    ParsePortalFooterJsonInterceptor,
  )
  update(
    @Body() body: Record<string, unknown>,
    @UploadedFiles() files?: { logo?: Express.Multer.File[] },
  ) {
    return this.portalFooterService.update(body, files);
  }
}
