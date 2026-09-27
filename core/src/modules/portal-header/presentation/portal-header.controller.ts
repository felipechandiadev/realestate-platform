import {
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
import { JwtAuthGuard, RolesGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { UserRole } from '../../users/domain/user.entity';
import { Audit, AuditInterceptor } from '../../../shared/interceptors/audit.interceptor';
import { AuditAction, AuditEntityType } from '../../../shared/enums/audit.enums';
import { PortalHeaderService } from '../application/portal-header.service';

@Injectable()
export class ParsePortalHeaderJsonInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const body = context.switchToHttp().getRequest().body ?? {};
    for (const field of ['navItems', 'accountItems']) {
      if (typeof body[field] === 'string') {
        try {
          body[field] = JSON.parse(body[field]);
        } catch {
          delete body[field];
        }
      }
    }
    return next.handle();
  }
}

@Controller('portal-header')
@ApiTags('Portal header')
@UseInterceptors(AuditInterceptor)
export class PortalHeaderController {
  constructor(private readonly portalHeaderService: PortalHeaderService) {}

  @Get()
  @ApiOperation({ summary: 'Public portal header configuration' })
  @Audit(AuditAction.READ, AuditEntityType.PORTAL_HEADER, 'Portal header retrieved')
  get() {
    return this.portalHeaderService.get();
  }

  @Patch()
  @ApiOperation({ summary: 'Update portal header' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Audit(AuditAction.UPDATE, AuditEntityType.PORTAL_HEADER, 'Portal header updated')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'logo', maxCount: 1 }]),
    ParsePortalHeaderJsonInterceptor,
  )
  update(
    @Body() body: Record<string, unknown>,
    @UploadedFiles() files?: { logo?: Express.Multer.File[] },
  ) {
    return this.portalHeaderService.update(body, files);
  }
}
