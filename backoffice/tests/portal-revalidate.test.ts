/** @jest-environment node */
import { revalidatePortal } from '../src/features/cms/infrastructure/portal-revalidate';

describe('revalidatePortal', () => {
  const env = { ...process.env };
  let fetchMock: jest.SpyInstance;
  beforeEach(() => {
    process.env.REVALIDATE_SECRET = 'secreto-de-prueba';
    process.env.NEXT_PUBLIC_PORTAL_URL = 'https://portal.ejemplo.cl/';
    delete process.env.PORTAL_INTERNAL_URL;
    fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, status: 200 } as Response);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => {
    jest.restoreAllMocks();
    process.env = { ...env };
  });

  it('llama al portal con el secreto y las etiquetas', async () => {
    expect(await revalidatePortal(['portal-header'])).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://portal.ejemplo.cl/api/revalidate');
    expect(init.headers['x-revalidate-secret']).toBe('secreto-de-prueba');
    expect(JSON.parse(init.body)).toEqual({ tags: ['portal-header'] });
  });

  it('prefiere la dirección interna del portal si existe', async () => {
    process.env.PORTAL_INTERNAL_URL = 'http://127.0.0.1:8001';
    await revalidatePortal(['identity']);
    expect(fetchMock.mock.calls[0][0]).toBe('http://127.0.0.1:8001/api/revalidate');
  });

  it('nunca lanza error: sin secreto, con portal caído o con respuesta de error devuelve false', async () => {
    delete process.env.REVALIDATE_SECRET;
    expect(await revalidatePortal(['identity'])).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();

    process.env.REVALIDATE_SECRET = 'x';
    fetchMock.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    expect(await revalidatePortal(['identity'])).toBe(false);

    fetchMock.mockResolvedValueOnce({ ok: false, status: 401 } as Response);
    expect(await revalidatePortal(['identity'])).toBe(false);
  });
});
