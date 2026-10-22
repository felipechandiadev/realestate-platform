import { AddPersonUseCase } from './add-person.usecase';
import { ContractRepository } from '../../domain/contract.repository';

describe('AddPersonUseCase', () => {
  it('en transacción bloquea la fila y escribe con el manager recibido', async () => {
    const txRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 'c1', people: [{ personId: 'p0', role: 'BUYER' }] }),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const repo = {
      findById: jest.fn(),
      update: jest.fn(),
      withManager: jest.fn(() => txRepo),
    } as unknown as ContractRepository;
    const manager = {} as any;

    await new AddPersonUseCase(repo).execute('c1', { personId: 'p1', role: 'SELLER' } as any, manager);

    expect(txRepo.findOne).toHaveBeenCalledWith({ where: { id: 'c1' }, lock: { mode: 'pessimistic_write' } });
    expect(txRepo.update).toHaveBeenCalledWith('c1', {
      people: [
        { personId: 'p0', role: 'BUYER' },
        { personId: 'p1', role: 'SELLER' },
      ],
    });
    expect((repo as any).update).not.toHaveBeenCalled();
    expect((repo as any).findById).not.toHaveBeenCalled();
  });

  it('sin manager mantiene el comportamiento anterior', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue({ id: 'c1', people: [] }),
      update: jest.fn(),
      withManager: jest.fn(),
    } as unknown as ContractRepository;

    await new AddPersonUseCase(repo).execute('c1', { personId: 'p1', role: 'SELLER' } as any);
    expect((repo as any).update).toHaveBeenCalledWith('c1', { people: [{ personId: 'p1', role: 'SELLER' }] });
    expect((repo as any).withManager).not.toHaveBeenCalled();
  });
});
