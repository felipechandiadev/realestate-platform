import { NotFoundException } from '@nestjs/common';
import { HardDeleteMultimediaUseCase } from './hard-delete-multimedia.usecase';

function setup(media: Record<string, unknown> | null) {
  const query = jest.fn().mockResolvedValue(undefined);
  const repo = {
    findOne: jest.fn().mockResolvedValue(media),
    remove: jest.fn().mockResolvedValue(undefined),
    createQueryBuilder: jest.fn(() => ({ connection: { manager: { query } } })),
  };
  return { useCase: new HardDeleteMultimediaUseCase(repo as any), repo, query };
}

describe('HardDeleteMultimediaUseCase · historial de la propiedad', () => {
  it('al borrar una imagen de una propiedad queda en su historial (archivo anterior, sin valor nuevo)', async () => {
    const { useCase, repo, query } = setup({ id: 'm1', propertyId: 'p1', filename: 'fachada.jpg' });

    await useCase.execute('m1', { userId: 'u1', channel: 'BACKOFFICE' });

    expect(repo.remove).toHaveBeenCalled();
    const [, params] = query.mock.calls[0] as unknown as [string, string[]];
    expect(params[1]).toBe('p1');
    expect(JSON.parse(params[0])[0]).toMatchObject({
      field: 'multimedia',
      kind: 'MEDIA',
      previousValue: 'fachada.jpg',
      newValue: null,
      changedBy: 'u1',
      source: { channel: 'BACKOFFICE', section: 'Multimedia' },
    });
  });

  it('multimedia que no es de una propiedad, o sin contexto, no toca ningún historial', async () => {
    const a = setup({ id: 'm1', propertyId: null, filename: 'logo.png' });
    await a.useCase.execute('m1', { userId: 'u1' });
    expect(a.repo.remove).toHaveBeenCalled();
    expect(a.query).not.toHaveBeenCalled();

    const b = setup({ id: 'm2', propertyId: 'p1', filename: 'x.jpg' });
    await b.useCase.execute('m2');
    expect(b.query).not.toHaveBeenCalled();
  });

  it('archivo inexistente -> 404 y no escribe nada', async () => {
    const { useCase, repo, query } = setup(null);
    await expect(useCase.execute('nope', { userId: 'u1' })).rejects.toThrow(NotFoundException);
    expect(repo.remove).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });
});
