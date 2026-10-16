import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
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
  const mockDocumentRepo = { findGrid: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
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
        { provide: DocumentRepository, useValue: mockDocumentRepo },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create delegates to use case', async () => {
    const dto = { title: 'Doc' } as any;
    mockCreate.execute.mockResolvedValue({ id: 'd1', title: 'Doc' });
    await expect(service.create(dto)).resolves.toEqual({ id: 'd1', title: 'Doc' });
    expect(mockCreate.execute).toHaveBeenCalledWith(dto);
  });

  it('findOne delegates to get use case', async () => {
    mockGet.execute.mockResolvedValue({ id: 'd1' });
    await expect(service.findOne('d1')).resolves.toEqual({ id: 'd1' });
    expect(mockGet.execute).toHaveBeenCalledWith('d1');
  });
});
