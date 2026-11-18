import { AgentMcpController } from './agent-mcp.controller';

const req: any = { headers: { authorization: 'Bearer rek_x' }, ip: '1.2.3.4', protocol: 'https', get: () => 'api.ejemplo.cl' };
const res: any = { status: jest.fn(), setHeader: jest.fn() };
const call = (c: AgentMcpController, body: any) => c.rpc(body, req, res);

describe('AgentMcpController', () => {
  const c = new AgentMcpController();
  afterEach(() => { jest.restoreAllMocks(); delete process.env.BACKEND_PUBLIC_URL; });

  it('initialize entrega las instrucciones, incluida la subida directa de imágenes', async () => {
    const r: any = await call(c, { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18' } });
    expect(r.result.protocolVersion).toBe('2025-06-18');
    expect(r.result.instructions).toMatch(/HTTP multipart directa, no por MCP/);
  });

  it('tools/list expone las herramientas y las notificaciones responden 202', async () => {
    const r: any = await call(c, { jsonrpc: '2.0', id: 2, method: 'tools/list' });
    expect(r.result.tools.map((t: any) => t.name)).toEqual(expect.arrayContaining(['create_property', 'get_image_upload_instructions']));
    expect(await call(c, { jsonrpc: '2.0', method: 'notifications/initialized' })).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(202);
  });

  it('get_image_upload_instructions devuelve el comando con la URL de la propiedad', async () => {
    process.env.BACKEND_PUBLIC_URL = 'https://api.mi-sitio.cl/';
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, status: 200, text: async () => '{}' } as any);
    const r: any = await call(c, { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'get_image_upload_instructions', arguments: { id: 'abc' } } });
    const t = r.result.content[0].text;
    expect(r.result.isError).toBe(false);
    expect(t).toContain('POST https://api.mi-sitio.cl/properties/abc/multimedia');
    expect(t).toContain('-F "files=@');
  });

  it('en producción la URL de subida es siempre https', async () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, status: 200, text: async () => '{}' } as any);
    const http: any = { ...req, protocol: 'http' };
    const r: any = await c.rpc({ jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'get_image_upload_instructions', arguments: { id: 'abc' } } }, http, res);
    process.env.NODE_ENV = prev;
    expect(r.result.content[0].text).toContain('POST https://api.ejemplo.cl/properties/abc/multimedia');
  });

  it('reenvía con la misma key y devuelve el error de la API como error de herramienta', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 400, text: async () => '{"message":["state: obligatorio"]}' } as any);
    const r: any = await call(c, { jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'create_property', arguments: { title: 'x' } } });
    expect(r.result.isError).toBe(true);
    expect(r.result.content[0].text).toContain('state: obligatorio');
    expect((spy.mock.calls[0][1] as any).headers.Authorization).toBe('Bearer rek_x');
  });
});
