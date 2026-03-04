import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { CreateDocumentUseCase } from './application/use-cases/create-document.usecase';
import { FindAllDocumentsUseCase } from './application/use-cases/find-all-documents.usecase';
import { FindDocumentsByPersonUseCase } from './application/use-cases/find-documents-by-person.usecase';
import { FindDocumentsByContractUseCase } from './application/use-cases/find-documents-by-contract.usecase';
import { GetDocumentUseCase } from './application/use-cases/get-document.usecase';
import { UpdateDocumentUseCase } from './application/use-cases/update-document.usecase';
import { SoftDeleteDocumentUseCase } from './application/use-cases/soft-delete-document.usecase';
import { UploadDocumentUseCase } from './application/use-cases/upload-document.usecase';
import { UploadDniUseCase } from './application/use-cases/upload-dni.usecase';

describe('DocumentService', () => {
  let service: DocumentService;

  const mockCreate = { execute: jest.fn() };
  const mockFindAll = { execute: jest.fn() };
  const mockFindByPerson = { execute: jest.fn() };
  const mockFindByContract = { execute: jest.fn() };
  const mockGet = { execute: jest.fn() };
  const mockUpdate = { execute: jest.fn() };
  const mockSoftDelete = { execute: jest.fn() };
  const mockUpload = { execute: jest.fn() };
  const mockUploadDni = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        { provide: CreateDocumentUseCase, useValue: mockCreate },
        { provide: FindAllDocumentsUseCase, useValue: mockFindAll },
        { provide: FindDocumentsByPersonUseCase, useValue: mockFindByPerson },
        { provide: FindDocumentsByContractUseCase, useValue: mockFindByContract },
        { provide: GetDocumentUseCase, useValue: mockGet },
        { provide: UpdateDocumentUseCase, useValue: mockUpdate },
        { provide: SoftDeleteDocumentUseCase, useValue: mockSoftDelete },
        { provide: UploadDocumentUseCase, useValue: mockUpload },
        { provide: UploadDniUseCase, useValue: mockUploadDni },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
