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
  InternalServerErrorException,
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

@ApiTags('multimedia')
@Controller('multimedia')
export class MultimediaUploadController {
  private readonly logger = new Logger(MultimediaUploadController.name);

  constructor(private readonly multimediaService: MultimediaStorageService) {}

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
  ): Promise<void> {
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

  @Get('*filepath')
  async serveFile(@Param('filepath') filepath: string, @Res() res: Response) {
    const file = await this.multimediaService.serveFile(filepath);
    res.end(file);
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string) {
    await this.multimediaService.deleteFile(id);
    return { statusCode: HttpStatus.OK, message: 'File deleted successfully' };
  }
}
