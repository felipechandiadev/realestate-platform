import { CreatePropertyUseCase } from './create-property.usecase';
import { PropertyStatus } from '../../../../shared/enums/property-status.enum';

function setup() {
  const saved: any[] = [];
  const repo: any = {
    createQueryBuilder: () => ({
      withDeleted: () => ({ select: () => ({ where: () => ({ getMany: async () => [] }) }) }),
    }),
    create: (v: any) => ({ ...v }),
    save: async (v: any) => { saved.push(v); return v; },
  };
  return { useCase: new CreatePropertyUseCase(repo), saved };
}
const base: any = { title: 'Casa', operationType: 'SALE' };

describe('CreatePropertyUseCase: agente y fecha de publicación', () => {
  it('una propiedad publicada sin agente deja al creador como agente y registra publishedAt', async () => {
    const { useCase } = setup();
    const p = await useCase.execute({ ...base, status: PropertyStatus.PUBLISHED }, 'user-1');
    expect(p.assignedAgentId).toBe('user-1');
    expect(p.publishedAt).toBeInstanceOf(Date);
  });

  it.each([PropertyStatus.PRE_APPROVED, PropertyStatus.SOLD, PropertyStatus.RENTED, PropertyStatus.CONTRACT_IN_PROGRESS])(
    '%s también deja al creador como agente',
    async (status) => {
      const { useCase } = setup();
      const p = await useCase.execute({ ...base, status }, 'user-1');
      expect(p.assignedAgentId).toBe('user-1');
    },
  );

  it('respeta el agente elegido', async () => {
    const { useCase } = setup();
    const p = await useCase.execute({ ...base, status: PropertyStatus.PUBLISHED, assignedAgentId: 'agente-9' }, 'user-1');
    expect(p.assignedAgentId).toBe('agente-9');
  });

  it('una solicitud (REQUEST) no asigna agente ni fecha de publicación', async () => {
    const { useCase } = setup();
    const p = await useCase.execute({ ...base, status: PropertyStatus.REQUEST }, 'user-1');
    expect(p.status).toBe(PropertyStatus.REQUEST);
    expect(p.assignedAgentId).toBeUndefined();
    expect(p.publishedAt).toBeUndefined();
  });

  it('sin estado parte como REQUEST, y un visitante anónimo nunca queda como agente', async () => {
    const { useCase } = setup();
    const a = await useCase.execute({ ...base }, 'anonymous');
    expect(a.status).toBe(PropertyStatus.REQUEST);
    const b = await useCase.execute({ ...base, status: PropertyStatus.PUBLISHED }, 'anonymous');
    expect(b.assignedAgentId).toBeUndefined();
  });
});
