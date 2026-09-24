import { Test, TestingModule } from '@nestjs/testing';
import { ContractsService } from './contracts.service';
import { CreateContractUseCase } from './application/use-cases/create-contract.usecase';
import { FindContractUseCase } from './application/use-cases/find-contract.usecase';
import { ChangeContractStatusUseCase } from './application/use-cases/change-contract-status.usecase';
import { DeleteContractUseCase } from './application/use-cases/delete-contract.usecase';
import { UpdateContractUseCase } from './application/use-cases/update-contract.usecase';
import { CloseContractUseCase } from './application/use-cases/close-contract.usecase';
import { FailContractUseCase } from './application/use-cases/fail-contract.usecase';
import { FindAllContractsUseCase } from './application/use-cases/find-all-contracts.usecase';
import { AddPaymentUseCase } from './application/use-cases/add-payment.usecase';
import { AddPersonUseCase } from './application/use-cases/add-person.usecase';
import { GetPeopleByRoleUseCase } from './application/use-cases/get-people-by-role.usecase';
import { ValidateRequiredRolesUseCase } from './application/use-cases/validate-required-roles.usecase';
import { Contract } from './domain/contract.entity';
import { ContractRepository } from './domain/contract.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment } from './domain/payment.entity';
import { Document } from '../document/domain/document.entity';
import { PersonOrmEntity } from '../person/infrastructure/persistence/person.orm-entity';
import { User } from '../users/domain/user.entity';
import { Property } from '../property/domain/property.entity';
import { NotificationsService } from '../notifications/application/notifications.service';
import { MultimediaService } from '../multimedia/application/multimedia.service';
import { StaticFilesService } from '../multimedia/services/static-files.service';

describe('ContractsService', () => {
  let service: ContractsService;

  const mockCreate = { execute: jest.fn() };
  const mockFind = { execute: jest.fn() };
  const mockChange = { execute: jest.fn() };
  const mockDelete = { execute: jest.fn() };
  const mockUpdate = { execute: jest.fn() };
  const mockClose = { execute: jest.fn() };
  const mockFail = { execute: jest.fn() };
  const mockFindAll = { execute: jest.fn() };
  const mockAddPayment = { execute: jest.fn() };
  const mockAddPerson = { execute: jest.fn() };
  const mockGetPeople = { execute: jest.fn() };
  const mockValidateRoles = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        { provide: CreateContractUseCase, useValue: mockCreate },
        { provide: FindContractUseCase, useValue: mockFind },
        { provide: ChangeContractStatusUseCase, useValue: mockChange },
        { provide: DeleteContractUseCase, useValue: mockDelete },
        { provide: UpdateContractUseCase, useValue: mockUpdate },
        { provide: CloseContractUseCase, useValue: mockClose },
        { provide: FailContractUseCase, useValue: mockFail },
        { provide: FindAllContractsUseCase, useValue: mockFindAll },
        { provide: AddPaymentUseCase, useValue: mockAddPayment },
        { provide: AddPersonUseCase, useValue: mockAddPerson },
        { provide: GetPeopleByRoleUseCase, useValue: mockGetPeople },
        { provide: ValidateRequiredRolesUseCase, useValue: mockValidateRoles },
        // repository and other dependencies
        { provide: ContractRepository, useValue: { findById: jest.fn() } },
        { provide: getRepositoryToken(Payment), useValue: {} },
        { provide: getRepositoryToken(Document), useValue: {} },
        { provide: getRepositoryToken(PersonOrmEntity), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Property), useValue: {} },
        { provide: NotificationsService, useValue: {} },
        { provide: MultimediaService, useValue: {} },
        { provide: StaticFilesService, useValue: {} },
      ],
    }).compile();

    service = module.get<ContractsService>(ContractsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create delegates', async () => {
    const dto = {} as any;
    mockCreate.execute.mockResolvedValue('c');
    const res = await service.create(dto);
    expect(res).toBe('c');
    expect(mockCreate.execute).toHaveBeenCalledWith(dto);
  });

  it('findOne returns contract when found', async () => {
    const contract = { id: '1' } as Contract;
    mockFind.execute.mockResolvedValue(contract);
    expect(await service.findOne('1')).toBe(contract);
  });

  it('findAll delegates', async () => {
    mockFindAll.execute.mockResolvedValue(['A']);
    expect(await service.findAll({})).toEqual(['A']);
    expect(mockFindAll.execute).toHaveBeenCalledWith({});
  });


  it('findOne throws if missing', async () => {
    mockFind.execute.mockResolvedValue(null);
    await expect(service.findOne('1')).rejects.toThrow();
  });

  it('update delegates and returns updated', async () => {
    const updated = { id: '1' } as Contract;
    mockUpdate.execute.mockResolvedValue(undefined);
    const repo = service['contractRepository'] as any;
    repo.findById = jest.fn().mockResolvedValue(updated);
    const res = await service.update('1', {} as any);
    expect(res).toBe(updated);
    expect(mockUpdate.execute).toHaveBeenCalledWith('1', {});
  });

  it('close delegates and returns updated', async () => {
    const updated = { id: '1' } as Contract;
    mockClose.execute.mockResolvedValue(undefined);
    const repo = service['contractRepository'] as any;
    repo.findById = jest.fn().mockResolvedValue(updated);
    const dto = { endDate: '2020-01-01', documents: [] } as any;
    const res = await service.close('1', dto);
    expect(res).toBe(updated);
    expect(mockClose.execute).toHaveBeenCalledWith('1', dto);
  });

  it('fail delegates and returns updated', async () => {
    const updated = { id: '1' } as Contract;
    mockFail.execute.mockResolvedValue(undefined);
    const repo = service['contractRepository'] as any;
    repo.findById = jest.fn().mockResolvedValue(updated);
    const res = await service.fail('1', new Date());
    expect(res).toBe(updated);
    expect(mockFail.execute).toHaveBeenCalled();
  });

  it('addPayment delegates', async () => {
    const result = { id: 'p' };
    mockAddPayment.execute.mockResolvedValue(result);
    const res = await service.addPayment('1', {} as any);
    expect(res).toBe(result);
    expect(mockAddPayment.execute).toHaveBeenCalledWith('1', {});
  });

  it('addPerson delegates and returns contract', async () => {
    const contract = { id: '1' } as Contract;
    mockAddPerson.execute.mockResolvedValue(undefined);
    const repo = service['contractRepository'] as any;
    repo.findById = jest.fn().mockResolvedValue(contract);
    const res = await service.addPerson('1', {} as any);
    expect(res).toBe(contract);
    expect(mockAddPerson.execute).toHaveBeenCalledWith('1', {});
  });

  it('getPeopleByRole delegates', async () => {
    mockGetPeople.execute.mockResolvedValue(['X']);
    expect(await service.getPeopleByRole('1', 'SELLER' as any)).toEqual(['X']);
    expect(mockGetPeople.execute).toHaveBeenCalledWith('1', 'SELLER');
  });

  it('validateRequiredRoles delegates', async () => {
    const contract = { id: '1' } as Contract;
    mockValidateRoles.execute.mockReturnValue({ valid: true, missingRoles: [] });
    expect(await service.validateRequiredRoles(contract)).toEqual({ valid: true, missingRoles: [] });
    expect(mockValidateRoles.execute).toHaveBeenCalledWith(contract);
  });
});
