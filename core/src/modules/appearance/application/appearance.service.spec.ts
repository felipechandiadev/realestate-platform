import { AppearanceService } from './appearance.service';

const LEGACY_COLORS = {
  primary: '#112233',
  secondary: '#223344',
  background: '#ffffff',
  foreground: '#131615',
  accent: '#334455',
};

describe('AppearanceService palette compatibility', () => {
  it('fills new palette fields with defaults when creating a legacy five-color template', async () => {
    const savedTemplate = {
      id: 'template-1',
      name: 'Legacy',
      ...LEGACY_COLORS,
    };
    const templateRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 'system', isSystem: true }),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      })),
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn((value: Record<string, unknown>) => value),
      save: jest.fn((value: Record<string, unknown>) => Promise.resolve({ ...savedTemplate, ...value })),
    };
    const appearanceRepository = {
      find: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    const service = new AppearanceService(
      appearanceRepository as never,
      templateRepository as never,
    );

    const result = await service.createTemplate({
      name: 'Legacy',
      ...LEGACY_COLORS,
    });

    expect(result).toMatchObject({
      ...LEGACY_COLORS,
      topBarBackground: '#ffffff',
      topBarForeground: '#131615',
      navbarBackground: '#ffffff',
      navbarForeground: '#131615',
      footerBackground: '#131615',
      footerForeground: '#ffffff',
    });
  });
});
