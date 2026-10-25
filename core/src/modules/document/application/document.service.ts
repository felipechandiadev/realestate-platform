import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import type { Express } from 'express';
import { Document } from '../domain/document.entity';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  UploadDocumentDto,
  UploadDNIDto,
} from '../dto/document.dto';
import { CreateDocumentUseCase } from './use-cases/create-document.usecase';
import { FindAllDocumentsUseCase } from './use-cases/find-all-documents.usecase';
import { FindDocumentsByPersonUseCase } from './use-cases/find-documents-by-person.usecase';
import { FindDocumentsByContractUseCase } from './use-cases/find-documents-by-contract.usecase';
import { GetDocumentUseCase } from './use-cases/get-document.usecase';
import { UpdateDocumentUseCase } from './use-cases/update-document.usecase';
import { SoftDeleteDocumentUseCase } from './use-cases/soft-delete-document.usecase';
import { UploadDocumentUseCase } from './use-cases/upload-document.usecase';
import { UploadDniUseCase } from './use-cases/upload-dni.usecase';
import { DocumentRepository } from '../domain/document.repository';

@Injectable()
export class DocumentService {
  constructor(
    private readonly createDocumentUseCase: CreateDocumentUseCase,
    private readonly findAllDocumentsUseCase: FindAllDocumentsUseCase,
    private readonly findDocumentsByPersonUseCase: FindDocumentsByPersonUseCase,
    private readonly findDocumentsByContractUseCase: FindDocumentsByContractUseCase,
    private readonly getDocumentUseCase: GetDocumentUseCase,
    private readonly updateDocumentUseCase: UpdateDocumentUseCase,
    private readonly softDeleteDocumentUseCase: SoftDeleteDocumentUseCase,
    private readonly uploadDocumentUseCase: UploadDocumentUseCase,
    private readonly uploadDniUseCase: UploadDniUseCase,
    private readonly documentRepository: DocumentRepository,
  ) {}


  async create(createDocumentDto: CreateDocumentDto): Promise<Document> {
    return this.createDocumentUseCase.execute(createDocumentDto);
  }

  async findAll(): Promise<Document[]> {
    return this.findAllDocumentsUseCase.execute();
  }

  async findGrid(query?: any) {
    return this.documentRepository.findGrid(query);
  }

  async exportExcel(query?: any): Promise<Buffer> {
    const { data } = await this.documentRepository.findGrid({ ...(query ?? {}), pagination: 'false' });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Documentos');
    sheet.columns = [
      { key: 'title', header: 'Título', width: 28 },
      { key: 'documentType', header: 'Tipo', width: 22 },
      { key: 'contractOperation', header: 'Tipo de contrato', width: 18 },
      { key: 'contract', header: 'Contrato', width: 18 },
      { key: 'status', header: 'Estado', width: 14 },
      { key: 'uploadedBy', header: 'Subido por', width: 22 },
      { key: 'person', header: 'Persona', width: 22 },
      { key: 'createdAt', header: 'Fecha', width: 20 },
    ];
    for (const row of data) {
      const uploader = row.uploadedBy as { personalInfo?: { firstName?: string; lastName?: string }; email?: string; username?: string } | undefined;
      const uploaderName = uploader
        ? `${uploader.personalInfo?.firstName || ''} ${uploader.personalInfo?.lastName || ''}`.trim() || uploader.username || uploader.email || ''
        : '';
      sheet.addRow({
        title: row.title,
        documentType: row.documentType?.name ?? '',
        contractOperation: row.contract?.operation ?? '',
        contract: row.contract?.code ?? '',
        status: row.status,
        uploadedBy: uploaderName,
        person: row.person?.name ?? '',
        createdAt: row.createdAt ?? '',
      });
    }
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async findByPersonId(personId: string): Promise<Document[]> {
    return this.findDocumentsByPersonUseCase.execute(personId);
  }

  async findByContractId(contractId: string): Promise<Document[]> {
    return this.findDocumentsByContractUseCase.execute(contractId);
  }

  async findOne(id: string): Promise<Document> {
    return this.getDocumentUseCase.execute(id);
  }

  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
  ): Promise<Document> {
    return this.updateDocumentUseCase.execute(id, updateDocumentDto);
  }

  async softDelete(id: string): Promise<void> {
    return this.softDeleteDocumentUseCase.execute(id);
  }

  async uploadDocument(
    file: Express.Multer.File,
    uploadDocumentDto: UploadDocumentDto & { uploadedById: string },
  ): Promise<Document> {
    return this.uploadDocumentUseCase.execute(file, uploadDocumentDto);
  }

  async uploadDNI(
    file: Express.Multer.File,
    uploadDNIDto: UploadDNIDto & { uploadedById: string },
    actor?: { id?: string; role?: string },
  ): Promise<Document> {
    return this.uploadDniUseCase.execute(file, uploadDNIDto, actor);
  }
}
