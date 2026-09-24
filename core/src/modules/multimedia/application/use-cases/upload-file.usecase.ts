import { Injectable, NotFoundException } from '@nestjs/common';
import type { Express } from 'express';
import { MultimediaUploadMetadata } from '../../interfaces/multimedia.interface';
import { StaticFilesService } from '../../infrastructure/storage/static-files.service';
import { MultimediaRepository } from '../../domain/multimedia.repository';
import { Multimedia, MultimediaType, MultimediaFormat } from '../../domain/multimedia.entity';
import * as path from 'path';
import { randomBytes } from 'crypto';
import * as fs from 'fs';

@Injectable()
export class UploadFileUseCase {
  constructor(
    private readonly repo: MultimediaRepository,
    private readonly staticFilesService: StaticFilesService,
  ) {}

  async execute(
    file: Express.Multer.File,
    metadata: MultimediaUploadMetadata,
    userId: string,
  ): Promise<Multimedia> {
    // determine type/format
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    const isDocument =
      file.mimetype.startsWith('application/') ||
      file.mimetype.startsWith('text/') ||
      file.mimetype.includes('pdf');

    let type: MultimediaType;
    let format: MultimediaFormat;

    if (isImage) {
      type = MultimediaType.PROPERTY_IMG;
      format = MultimediaFormat.IMG;
    } else if (isVideo) {
      type = MultimediaType.PROPERTY_VIDEO;
      format = MultimediaFormat.VIDEO;
    } else if (isDocument) {
      type = MultimediaType.DOCUMENT;
      format = MultimediaFormat.DOCUMENT;
    } else {
      throw new Error(`Unsupported file type: ${file.mimetype}`);
    }

    const fileExtension = path.extname(file.originalname);
    const uniqueId = randomBytes(16).toString('hex');
    const uniqueFilename = `${uniqueId}${fileExtension}`;

    let relativePath: string;
    switch (type) {
      case MultimediaType.PROPERTY_IMG:
        relativePath = `PROPERTY_IMG/${uniqueFilename}`;
        break;
      case MultimediaType.PROPERTY_VIDEO:
        relativePath = `PROPERTY_VIDEO/${uniqueFilename}`;
        break;
      case MultimediaType.DOCUMENT:
        relativePath = `docs/${uniqueFilename}`;
        break;
      default:
        relativePath = `temp/${uniqueFilename}`;
    }

    await this.staticFilesService.saveFile(file.buffer, relativePath);

    const multimedia = new Multimedia();
    multimedia.filename = uniqueFilename;
    multimedia.url = this.staticFilesService.getPublicUrl(relativePath);
    multimedia.type = type;
    multimedia.format = format;
    multimedia.fileSize = file.size;
    multimedia.seoTitle = metadata.seoTitle || file.originalname;
    multimedia.description = metadata.description;
    multimedia.userId = userId;

    return await this.repo.save(multimedia as any);
  }
}