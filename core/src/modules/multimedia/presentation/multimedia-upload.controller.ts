import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  Body,
  Res,
  HttpStatus,
  Logger,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
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
import { Roles } from '../../auth/guards/jwt-auth.guard';
import { UserRole } from '../../users/domain/user.entity';

/** Tipos que un usuario COMMUNITY puede subir desde el portal. */
const COMMUNITY_UPLOAD_TYPES: MultimediaType[] = [
  MultimediaType.DNI_FRONT,
  MultimediaType.DNI_REAR,
];

/**
 * Normaliza la ruta pedida y rechaza `..`, rutas absolutas y bytes nulos,
 * para impedir path traversal fuera del almacenamiento.
 */
export function normalizeRelativeFilePath(raw: string | string[]): string {
  const joined = Array.isArray(raw) ? raw.join('/') : String(raw ?? '');
  let decoded: string;
  try {
    decoded = decodeURIComponent(joined);
  } catch {
    throw new BadRequestException('Ruta de archivo inválida');
  }
  const unified = decoded.replace(/\\/g, '/');
  if (
    !unified ||
    unified.includes('\0') ||
    unified.startsWith('/') ||
    /^[a-zA-Z]:/.test(unified) ||
    unified.split('/').some((segment) => segment === '..')
  ) {
    throw new BadRequestException('Ruta de archivo inválida');
  }
  return unified
    .split('/')
    .filter((segment) => segment !== '' && segment !== '.')
    .join('/');
}

@ApiTags('multimedia')
@Roles(UserRole.ADMIN, UserRole.AGENT)
@Controller('multimedia')
export class MultimediaUploadController {
  private readonly logger = new Logger(MultimediaUploadController.name);

  constructor(private readonly multimediaService: MultimediaStorageService) {}

  // Cualquier usuario autenticado; COMMUNITY solo puede subir su DNI (portal).
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.COMMUNITY)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
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
    try {
      this.logger.log('=== MULTIMEDIA UPLOAD START ===');
      this.logger.log('File received:', file?.originalname, file?.size);
      this.logger.log('Metadata received:', metadata);
      this.logger.log('userId from res.locals:', res.locals?.userId);

      if (!file) {
        this.logger.error('No file uploaded');
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'No file provided' });
        return;
      }

      if (!metadata?.type) {
        this.logger.error('No type provided in metadata');
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Type is required' });
        return;
      }

      this.logger.log('Calling uploadFile service...');
      const multimedia = await this.multimediaService.uploadFile(
        file,
        metadata,
        res.locals?.userId,
      );

      this.logger.log('File saved successfully:', multimedia.filename);
      this.logger.log('=== MULTIMEDIA UPLOAD END ===');

      res.status(HttpStatus.CREATED).json({
        id: multimedia.id,
        url: multimedia.url,
        filename: multimedia.filename,
        fileSize: multimedia.fileSize,
        type: multimedia.type,
      });
    } catch (error) {
      this.logger.error('=== MULTIMEDIA UPLOAD ERROR ===');
      this.logger.error('Error message:', error?.message);
      this.logger.error('Error stack:', error?.stack);
      this.logger.error('Full error:', error);

      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({
          message: error?.message || 'Error uploading file',
          error: error?.toString(),
        });
    }
  }

  // Fase 1: solo ADMIN (no lo usa ningún frontend). Candidato a eliminar en Fase 2.
  @Roles(UserRole.ADMIN)
  @Get('*filepath')
  async serveFile(
    @Param('filepath') filepath: string | string[],
    @Res() res: Response,
  ) {
    const file = await this.multimediaService.serveFile(
      normalizeRelativeFilePath(filepath),
    );
    res.end(file);
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string) {
    await this.multimediaService.deleteFile(id);
    return { statusCode: HttpStatus.OK, message: 'File deleted successfully' };
  }
}
