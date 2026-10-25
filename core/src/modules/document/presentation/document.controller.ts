import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DEFAULT_UPLOAD_OPTIONS } from '../../../shared/upload/upload-limits';
import {
  DNI_UPLOAD_KINDS,
  DOCUMENT_UPLOAD_KINDS,
  assertAllowedFileSignature,
} from '../../../shared/upload/file-signature';
import { DocumentService } from '../application/document.service';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  UploadDocumentDto,
  UploadDNIDto,
} from '../dto/document.dto';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import type { Express, Request, Response } from 'express';
import { JweAuthGuard } from '../../auth/infrastructure/jwe/jwe-auth.guard';
import { JwtAuthGuard, RolesGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { UserRole } from '../../users/domain/user.entity';

type AuthenticatedRequest = Request & { user?: { id?: string; role?: string } };

@ApiTags('Documents')
@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  /**
   * Create a new document record
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Create new document' })
  @ApiResponse({
    status: 201,
    description: 'Document created successfully',
  })
  @ApiBody({ type: CreateDocumentDto })
  create(@Body(ValidationPipe) createDocumentDto: CreateDocumentDto) {
    return this.documentService.create(createDocumentDto);
  }

  /**
   * Upload a document file
   */
  @Post('upload')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Upload document file' })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
  })
  @UseGuards(JweAuthGuard)
  @UseInterceptors(FileInterceptor('file', DEFAULT_UPLOAD_OPTIONS))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: {
          type: 'string',
        },
        documentTypeId: {
          type: 'string',
          format: 'uuid',
        },
        uploadedById: {
          type: 'string',
          format: 'uuid',
        },
        personId: {
          type: 'string',
          format: 'uuid',
        },
        status: {
          type: 'string',
          enum: ['PENDING', 'UPLOADED', 'RECIBIDO', 'REJECTED'],
        },
        notes: {
          type: 'string',
        },
        seoTitle: {
          type: 'string',
        },
        required: {
          type: 'boolean',
        },
      },
    },
  })
  uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body(ValidationPipe) uploadDocumentDto: UploadDocumentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    assertAllowedFileSignature(file, DOCUMENT_UPLOAD_KINDS);
    // Quien sube es siempre el usuario del token, nunca un id enviado en el cuerpo.
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    const resolvedDto: UploadDocumentDto & { uploadedById: string } = {
      ...uploadDocumentDto,
      uploadedById: userId,
    };
    return this.documentService.uploadDocument(file, resolvedDto);
  }

  /**
   * Upload a DNI file (frontal or trasero)
   */
  @Post('upload-dni')
  // COMMUNITY solo para su propia ficha (se valida en UploadDniUseCase).
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.COMMUNITY)
  @ApiOperation({ summary: 'Upload DNI file' })
  @ApiResponse({
    status: 201,
    description: 'DNI uploaded successfully',
  })
  @UseGuards(JweAuthGuard)
  @UseInterceptors(FileInterceptor('file', DEFAULT_UPLOAD_OPTIONS))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        dniSide: {
          type: 'string',
          enum: ['FRONT', 'REAR'],
        },
        uploadedById: {
          type: 'string',
          format: 'uuid',
        },
        personId: {
          type: 'string',
          format: 'uuid',
        },
        status: {
          type: 'string',
          enum: ['PENDING', 'UPLOADED', 'RECIBIDO', 'REJECTED'],
        },
      },
    },
  })
  uploadDNI(
    @UploadedFile() file: Express.Multer.File,
    @Body(ValidationPipe) uploadDNIDto: UploadDNIDto,
    @Req() req: AuthenticatedRequest,
  ) {
    assertAllowedFileSignature(file, DNI_UPLOAD_KINDS);
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    const resolvedDto: UploadDNIDto & { uploadedById: string } = {
      ...uploadDNIDto,
      uploadedById: userId,
    };
    return this.documentService.uploadDNI(file, resolvedDto, req.user);
  }

  /**
   * Get all documents
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Get all documents (optionally filtered by personId)' })
  @ApiResponse({
    status: 200,
    description: 'List of all documents',
  })
  findAll(@Body() body: any, @Req() req: AuthenticatedRequest, @Query() query: Record<string, string | undefined>) {
    // Support ?personId=... as query param
    const personId = req.query?.personId;
    const contractId = req.query?.contractId;
    if (personId) {
      return this.documentService.findByPersonId(String(Array.isArray(personId) ? personId[0] : personId));
    }
    if (contractId) {
      return this.documentService.findByContractId(String(Array.isArray(contractId) ? contractId[0] : contractId));
    }
    const wantsGrid = Boolean(query?.page || query?.sort || query?.sortField || query?.filters || query?.search || query?.limit);
    if (wantsGrid) {
      return this.documentService.findGrid(query);
    }
    return this.documentService.findAll();
  }

  @Get('excel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  async exportExcel(@Query() query: Record<string, string | undefined>, @Res() res: Response) {
    const buffer = await this.documentService.exportExcel(query);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="documentos.xlsx"',
    });
    res.send(buffer);
  }

  /**
   * Get document by ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({
    status: 200,
    description: 'Document details',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  @ApiParam({ name: 'id', type: String })
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(id);
  }

  /**
   * Update document
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Update document' })
  @ApiResponse({
    status: 200,
    description: 'Document updated successfully',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateDocumentDto })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentService.update(id, updateDocumentDto);
  }

  /**
   * Delete document (soft delete)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Delete document' })
  @ApiResponse({
    status: 200,
    description: 'Document deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  @ApiParam({ name: 'id', type: String })
  softDelete(@Param('id') id: string) {
    return this.documentService.softDelete(id);
  }
}
