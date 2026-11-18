/** @jest-environment node */
import { revalidateTag } from 'next/cache';
import { POST } from '../app/api/revalidate/route';

jest.mock('next/cache', () => ({ revalidateTag: jest.fn() }));

const call = (body: unknown, secret?: string) =>
  POST(
    new Request('http://localhost/api/revalidate', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(secret ? { 'x-revalidate-secret': secret } : {}) },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );

describe('POST /api/revalidate', () => {
  const prev = process.env.REVALIDATE_SECRET;
  beforeEach(() => {
    process.env.REVALIDATE_SECRET = 'secreto-de-prueba';
    (revalidateTag as jest.Mock).mockClear();
  });
  afterAll(() => {
    if (prev === undefined) delete process.env.REVALIDATE_SECRET;
    else process.env.REVALIDATE_SECRET = prev;
  });

  it('con el secreto correcto invalida las etiquetas sin servir datos viejos', async () => {
    const res = await call({ tags: ['portal-header', 'identity', 'portal-header'] }, 'secreto-de-prueba');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ revalidated: ['portal-header', 'identity'] });
    expect(revalidateTag).toHaveBeenCalledTimes(2);
    expect(revalidateTag).toHaveBeenCalledWith('portal-header', { expire: 0 });
  });

  it('rechaza secreto incorrecto o ausente (401) y no invalida nada', async () => {
    expect((await call({ tags: ['identity'] }, 'otro')).status).toBe(401);
    expect((await call({ tags: ['identity'] })).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('queda deshabilitada (503) si no hay secreto configurado', async () => {
    delete process.env.REVALIDATE_SECRET;
    expect((await call({ tags: ['identity'] }, 'cualquiera')).status).toBe(503);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('solo acepta etiquetas permitidas y un cuerpo válido (400)', async () => {
    const bad = await call({ tags: ['identity', 'otra-cosa'] }, 'secreto-de-prueba');
    expect(bad.status).toBe(400);
    expect((await bad.json()).error).toMatch(/otra-cosa/);
    expect((await call({ tags: [] }, 'secreto-de-prueba')).status).toBe(400);
    expect((await call({ tags: 'identity' }, 'secreto-de-prueba')).status).toBe(400);
    expect((await call('no es json', 'secreto-de-prueba')).status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
