import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Res,
  HttpStatus,
  HttpException,
  Logger,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MultimediaStorageService } from '../infrastructure/storage/multimedia-storage.service';
import { MultimediaType } from '../domain/multimedia.entity';
import type { Response } from 'express';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import {
  MultimediaUploadMetadata,
  MultimediaResponse,
} from '../interfaces/multimedia.interface';
import type { Express } from 'express';
import { VIDEO_UPLOAD_OPTIONS } from '../../../shared/upload/upload-limits';
import {
  DNI_UPLOAD_KINDS,
  MULTIMEDIA_UPLOAD_KINDS,
  assertAllowedFileSignature,
  assertNonVideoSizeLimit,
} from '../../../shared/upload/file-signature';
import { Roles } from '../../auth/guards/jwt-auth.guard';
import { UserRole } from '../../users/domain/user.entity';

/** Tipos que un usuario COMMUNITY puede subir desde el portal. */
const COMMUNITY_UPLOAD_TYPES: MultimediaType[] = [
  MultimediaType.DNI_FRONT,
  MultimediaType.DNI_REAR,
];

@ApiTags('multimedia')
@Roles(UserRole.ADMIN, UserRole.AGENT)
@Controller('multimedia')
export class MultimediaUploadController {
  private readonly logger = new Logger(MultimediaUploadController.name);

  constructor(private readonly multimediaService: MultimediaStorageService) {}

  // Cualquier usuario autenticado; COMMUNITY solo puede subir su DNI (portal).
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.COMMUNITY)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', VIDEO_UPLOAD_OPTIONS))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
          enum: Object.values(MultimediaType),
        },
        seoTitle: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata: MultimediaUploadMetadata,
    @Res() res: Response,
    @Req() req?: any,
  ): Promise<void> {
    if (
      req?.user?.role === UserRole.COMMUNITY &&
      !COMMUNITY_UPLOAD_TYPES.includes(metadata?.type as MultimediaType)
    ) {
      throw new ForbiddenException('Tipo de archivo no permitido para este usuario');
    }
    if (!file) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'No file provided' });
      return;
    }

    if (!metadata?.type) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Type is required' });
      return;
    }

    // Firma real del archivo (magic bytes) + 20 MB para lo que no es video.
    const kind = assertAllowedFileSignature(
      file,
      req?.user?.role === UserRole.COMMUNITY
        ? DNI_UPLOAD_KINDS
        : MULTIMEDIA_UPLOAD_KINDS,
    );
    assertNonVideoSizeLimit(file, kind);

    try {
      const multimedia = await this.multimediaService.uploadFile(
        file,
        metadata,
        req?.user?.id,
      );

      res.status(HttpStatus.CREATED).json({
        id: multimedia.id,
        url: multimedia.url,
        filename: multimedia.filename,
        fileSize: multimedia.fileSize,
        type: multimedia.type,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        `Error subiendo multimedia: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error al subir el archivo' });
    }
  }
}
