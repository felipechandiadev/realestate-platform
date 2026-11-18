import { Body, Controller, Delete, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Roles } from '../../auth/presentation/decorators/roles.decorator';
import { UserRole } from '../../users/domain/user.entity';
import { MCP_INSTRUCTIONS, imageUploadInstructions, resolveApiBaseUrl } from '../application/agent-guide';

const SUPPORTED_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];
const MAX_TEXT = 20_000;

const obj = (properties: Record<string, unknown>, required: string[] = []) => ({
  type: 'object',
  properties,
  required,
  additionalProperties: false,
});
const id = { type: 'string', description: 'ID (UUID) de la propiedad' };

const TOOLS = [
  {
    name: 'get_catalogs',
    description: 'Valores válidos y reglas: regiones con sus comunas, tipos de propiedad (con su id), estados, monedas y límites de imágenes. Llámala primero.',
    inputSchema: obj({}),
  },
  {
    name: 'search_properties',
    description: 'Lista propiedades (incluye borradores REQUEST), paginadas y con filtros opcionales.',
    inputSchema: obj({
      status: { type: 'string', description: 'REQUEST, PRE-APPROVED, PUBLISHED, INACTIVE, SOLD, RENTED o CONTRACT-IN-PROGRESS' },
      operationType: { type: 'string', enum: ['SALE', 'RENT'] },
      state: { type: 'string', description: 'Región (nombre exacto)' },
      city: { type: 'string', description: 'Comuna (nombre exacto)' },
      q: { type: 'string', description: 'Texto a buscar en título o código' },
      page: { type: 'integer', minimum: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 50 },
    }),
  },
  {
    name: 'get_property',
    description: 'Ficha completa de una propiedad (datos, ubicación, características, imágenes y qué datos faltan para publicar).',
    inputSchema: obj({ id }, ['id']),
  },
  {
    name: 'create_property',
    description: 'Crea una propiedad. Obligatorios: title, status, operationType, state, city (nombres exactos de get_catalogs). Con price indica también currencyPrice (CLP entero o UF). Para publicar directo usa status PUBLISHED junto con assignedAgentId (requiere permiso de publicar). Después sube las imágenes con get_image_upload_instructions.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' }, description: { type: 'string' },
        status: { type: 'string', enum: ['REQUEST', 'PRE-APPROVED', 'PUBLISHED', 'INACTIVE', 'SOLD', 'RENTED', 'CONTRACT-IN-PROGRESS'] },
        operationType: { type: 'string', enum: ['SALE', 'RENT'] },
        propertyTypeId: { type: 'string', description: 'id de un tipo de get_catalogs' },
        assignedAgentId: { type: 'string', description: 'id de un agente de get_catalogs > agents. OBLIGATORIO si status es PRE-APPROVED, PUBLISHED, CONTRACT-IN-PROGRESS, SOLD o RENTED' },
        state: { type: 'string', description: 'Región, nombre exacto del catálogo' },
        city: { type: 'string', description: 'Comuna de esa región, nombre exacto del catálogo' },
        address: { type: 'string' },
        location: { type: 'object', properties: { lat: { type: 'number' }, lng: { type: 'number' }, address: { type: 'string' } } },
        bedrooms: { type: 'number' }, bathrooms: { type: 'number' }, parkingSpaces: { type: 'number' }, floors: { type: 'number' },
        builtSquareMeters: { type: 'number' }, landSquareMeters: { type: 'number' }, constructionYear: { type: 'number' },
        otherFeatures: { type: 'array', items: { type: 'string' } },
        price: { type: 'number' }, currencyPrice: { type: 'string', enum: ['CLP', 'UF'] },
        seoTitle: { type: 'string' }, seoDescription: { type: 'string' },
        internalNotes: { type: 'string' },
      },
      required: ['title', 'status', 'operationType', 'state', 'city'],
      additionalProperties: false,
    },
  },
  {
    name: 'update_property',
    description: 'Edita una sección de una propiedad. basic: title, description, status, operationType, propertyTypeId, assignedAgentId, isFeatured, price, currencyPrice. price: price, currencyPrice. characteristics: bedrooms, bathrooms, parkingSpaces, floors, builtSquareMeters, landSquareMeters, constructionYear, otherFeatures. location: address, state, city, latitude, longitude. seo: seoTitle, seoDescription. Enviar solo los campos a cambiar.',
    inputSchema: obj({
      id,
      section: { type: 'string', enum: ['basic', 'price', 'characteristics', 'location', 'seo'] },
      data: { type: 'object', description: 'Campos de la sección a cambiar' },
    }, ['id', 'section', 'data']),
  },
  {
    name: 'set_main_image',
    description: 'Define la imagen principal con la URL de una imagen ya subida a la propiedad (la ves en get_property > media.images).',
    inputSchema: obj({ id, imageUrl: { type: 'string' } }, ['id', 'imageUrl']),
  },
  {
    name: 'get_image_upload_instructions',
    description: 'Devuelve el comando exacto (curl / Python) para subir imágenes a una propiedad por HTTP directo. Las imágenes NO se suben por MCP. Léelo y ejecútalo.',
    inputSchema: obj({ id }, ['id']),
  },
];

const text = (t: string, isError = false) => ({ content: [{ type: 'text', text: t.length > MAX_TEXT ? t.slice(0, MAX_TEXT) + '\n…(recortado)' : t }], isError });

/**
 * Servidor MCP (Streamable HTTP, sin sesión). Cada herramienta llama a la propia API con la
 * misma key del agente, así se aplican los mismos permisos, validaciones e historial.
 */
@ApiExcludeController()
@Roles(UserRole.ADMIN, UserRole.AGENT)
@Controller('mcp')
export class AgentMcpController {
  @Post()
  @HttpCode(200)
  async rpc(@Body() body: any, @Req() req: any, @Res({ passthrough: true }) res: any) {
    if (Array.isArray(body)) {
      const out = (await Promise.all(body.map((m) => this.handle(m, req)))).filter(Boolean);
      if (!out.length) { res.status(202); return; }
      return out;
    }
    const out = await this.handle(body, req);
    if (!out) { res.status(202); return; }
    return out;
  }

  @Get()
  @HttpCode(405)
  noStream(@Res({ passthrough: true }) res: any) {
    res.setHeader('Allow', 'POST');
    return { error: 'Este servidor MCP no ofrece stream SSE; usa POST' };
  }

  @Delete()
  @HttpCode(405)
  noSessions() {
    return { error: 'Este servidor MCP no usa sesiones' };
  }

  private async handle(msg: any, req: any): Promise<any | null> {
    const idv = msg?.id;
    const reply = (result: unknown) => ({ jsonrpc: '2.0', id: idv, result });
    const fail = (code: number, message: string) => ({ jsonrpc: '2.0', id: idv ?? null, error: { code, message } });
    if (!msg || msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') return fail(-32600, 'Solicitud JSON-RPC inválida');
    if (idv === undefined) return null; // notificación

    switch (msg.method) {
      case 'initialize': {
        const asked = msg.params?.protocolVersion;
        return reply({
          protocolVersion: SUPPORTED_VERSIONS.includes(asked) ? asked : SUPPORTED_VERSIONS[1],
          capabilities: { tools: {} },
          serverInfo: { name: 'realestate-platform', version: '1.0.0' },
          instructions: MCP_INSTRUCTIONS,
        });
      }
      case 'ping':
        return reply({});
      case 'tools/list':
        return reply({ tools: TOOLS });
      case 'tools/call':
        return reply(await this.callTool(msg.params?.name, msg.params?.arguments ?? {}, req));
      default:
        return fail(-32601, `Método no soportado: ${msg.method}`);
    }
  }

  private async api(req: any, method: string, path: string, body?: unknown) {
    const base = `http://127.0.0.1:${process.env.PORT || 8000}`;
    const res = await fetch(base + path, {
      method,
      headers: {
        Authorization: String(req.headers.authorization ?? ''),
        'Content-Type': 'application/json',
        // Para que el límite de peticiones cuente por el cliente real, no por 127.0.0.1.
        'X-Forwarded-For': String(req.ip ?? ''),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const raw = await res.text();
    return { ok: res.ok, status: res.status, raw };
  }

  private async callTool(name: string, a: any, req: any) {
    try {
      const run = async (method: string, path: string, body?: unknown, hint = '') => {
        const r = await this.api(req, method, path, body);
        if (!r.ok) return text(`Error ${r.status}: ${r.raw}`, true);
        return text(r.raw + hint);
      };
      const pid = encodeURIComponent(String(a.id ?? ''));
      switch (name) {
        case 'get_catalogs':
          return run('GET', '/agent/catalogs');
        case 'search_properties': {
          const qs = new URLSearchParams();
          for (const k of ['status', 'operationType', 'state', 'city', 'q', 'page', 'limit']) {
            if (a[k] !== undefined && a[k] !== '') qs.set(k, String(a[k]));
          }
          return run('GET', `/agent/properties?${qs}`);
        }
        case 'get_property':
          return run('GET', `/agent/properties/${pid}`);
        case 'create_property':
          return run('POST', '/properties', a,
            '\n\nSiguiente paso: sube las imágenes con HTTP directo (llama a get_image_upload_instructions con el id de esta propiedad).');
        case 'update_property': {
          if (!['basic', 'price', 'characteristics', 'location', 'seo'].includes(a.section)) {
            return text('section debe ser basic, price, characteristics, location o seo', true);
          }
          return run('PATCH', `/properties/${pid}/${a.section}`, a.data ?? {});
        }
        case 'set_main_image':
          return run('PATCH', `/properties/${pid}/main-image`, { mainImageUrl: a.imageUrl });
        case 'get_image_upload_instructions': {
          const check = await this.api(req, 'GET', `/agent/properties/${pid}`);
          if (!check.ok) return text(`Error ${check.status}: ${check.raw}`, true);
          return text(imageUploadInstructions(resolveApiBaseUrl(req), String(a.id)));
        }
        default:
          return text(`Herramienta desconocida: ${name}`, true);
      }
    } catch (e) {
      return text(`Error interno: ${e instanceof Error ? e.message : String(e)}`, true);
    }
  }
}
