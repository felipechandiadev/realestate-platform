/** Tests unitarios (sin BD): los listados públicos no exponen datos internos. */
import { PropertyStatus } from '../../../shared/enums/property-status.enum';
import { toPublicPropertyListItem } from './public-property.mapper';
import { FindPublishedFeaturedPublicUseCase } from './use-cases/find-published-featured-public.usecase';
import { PropertyService } from './property.service';

const entity = {
  id: 'p1',
  title: 'Casa',
  status: PropertyStatus.PUBLISHED,
  price: 100,
  internalNotes: 'secreto',
  creatorUserId: 'u1',
  changeHistory: [{ changedBy: 'u1' }],
  views: [{ userId: 'u2' }],
  leads: [{ contactInfo: { email: 'lead@x.cl' } }],
  favorites: [{ userId: 'a' }],
  postRequest: { contactEmail: 'dueño@x.cl' },
  propertyType: { id: 't1', name: 'Casa', hasBedrooms: true, description: 'interno' },
  multimedia: [{ id: 'm1', url: 'x.jpg', uploadedById: 'u1' }],
};

const FORBIDDEN = [
  'internalNotes',
  'creatorUserId',
  'changeHistory',
  'views',
  'leads',
  'favorites',
  'postRequest',
];

describe('toPublicPropertyListItem', () => {
  it('quita datos internos y conserva las banderas del tipo', () => {
    const out: any = toPublicPropertyListItem(entity);
    for (const key of FORBIDDEN) expect(out).not.toHaveProperty(key);
    expect(out.favoritesCount).toBe(1);
    expect(out.propertyType).toEqual({
      id: 't1',
      name: 'Casa',
      hasBedrooms: true,
      hasBathrooms: undefined,
      hasBuiltSquareMeters: undefined,
      hasLandSquareMeters: undefined,
      hasParkingSpaces: undefined,
      hasFloors: undefined,
      hasConstructionYear: undefined,
    });
    expect(out.multimedia[0]).not.toHaveProperty('uploadedById');
  });
});

describe('listados públicos', () => {
  it('destacadas devuelve la vista pública', async () => {
    const qb: any = {};
    for (const m of ['leftJoinAndSelect', 'where', 'andWhere', 'orderBy', 'addOrderBy']) {
      qb[m] = jest.fn().mockReturnValue(qb);
    }
    qb.getMany = jest.fn().mockResolvedValue([entity]);
    const useCase = new FindPublishedFeaturedPublicUseCase({
      createQueryBuilder: () => qb,
    } as any);
    const [row]: any[] = await useCase.execute();
    for (const key of FORBIDDEN) expect(row).not.toHaveProperty(key);
  });

  it('relacionadas: vacío si la base no está publicada y vista pública si lo está', async () => {
    const repo = { findOne: jest.fn() };
    const service: any = Object.create(PropertyService.prototype);
    service.propertyRepository = repo;
    service.getRelatedProperties = jest.fn().mockResolvedValue([entity]);

    repo.findOne.mockResolvedValue({ id: 'x', status: PropertyStatus.REQUEST });
    await expect(service.getPublicRelatedProperties('x', 3)).resolves.toEqual([]);
    expect(service.getRelatedProperties).not.toHaveBeenCalled();

    repo.findOne.mockResolvedValue({ id: 'x', status: PropertyStatus.PUBLISHED });
    const [row] = await service.getPublicRelatedProperties('x', 3);
    for (const key of FORBIDDEN) expect(row).not.toHaveProperty(key);
  });
});
