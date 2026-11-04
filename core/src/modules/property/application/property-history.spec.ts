import {
  appendPropertyHistory,
  buildSource,
  channelFromUser,
  diffProperty,
  eventEntry,
  historyContextFromRequest,
  kindForStatus,
  sectionForField,
  valuesEqual,
} from './property-history';

const NOW = new Date('2026-11-04T15:00:00.000Z');
const ctx = { userId: 'u1', channel: 'BACKOFFICE' as const };

describe('property-history', () => {
  describe('valuesEqual', () => {
    it('null, undefined, "" y listas/objetos vacíos cuentan como vacío', () => {
      for (const a of [null, undefined, '', [], {}]) {
        for (const b of [null, undefined, '', [], {}]) {
          expect(valuesEqual(a, b)).toBe(true);
        }
      }
      expect(valuesEqual(null, 0)).toBe(false);
      expect(valuesEqual('', 'x')).toBe(false);
      expect(valuesEqual([], ['POOL'])).toBe(false);
    });

    it('listas y objetos se comparan por contenido, no por referencia', () => {
      expect(valuesEqual(['POOL', 'GYM'], ['POOL', 'GYM'])).toBe(true);
      expect(valuesEqual(['POOL', 'GYM'], ['GYM', 'POOL'])).toBe(false);
      expect(valuesEqual(['POOL'], ['POOL', 'GYM'])).toBe(false);
      expect(valuesEqual({ a: 1, b: [1, 2] }, { b: [1, 2], a: 1 })).toBe(true);
      expect(valuesEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it('números y decimales de MySQL (texto) son iguales si valen lo mismo', () => {
      expect(valuesEqual('150000000.00', 150000000)).toBe(true);
      expect(valuesEqual(0, '0')).toBe(true);
      expect(valuesEqual('100', 120)).toBe(false);
      expect(valuesEqual('abc', 5)).toBe(false);
    });

    it('textos sin espacios sobrantes, booleanos y fechas', () => {
      expect(valuesEqual('  Casa ', 'Casa')).toBe(true);
      expect(valuesEqual('Casa', 'Depto')).toBe(false);
      expect(valuesEqual(true, 1)).toBe(true);
      expect(valuesEqual(false, true)).toBe(false);
      expect(valuesEqual(new Date('2026-01-01'), '2026-01-01T00:00:00.000Z')).toBe(true);
    });
  });

  describe('kindForStatus', () => {
    it('publicación, despublicación y cambio de estado', () => {
      expect(kindForStatus('INACTIVE', 'PUBLISHED')).toBe('PUBLISHED');
      expect(kindForStatus('PUBLISHED', 'INACTIVE')).toBe('UNPUBLISHED');
      // Que arranque un contrato o se venda no es "despublicar".
      expect(kindForStatus('PUBLISHED', 'CONTRACT-IN-PROGRESS')).toBe('STATUS_CHANGED');
      expect(kindForStatus('CONTRACT-IN-PROGRESS', 'SOLD')).toBe('STATUS_CHANGED');
      expect(kindForStatus('REQUEST', 'PRE-APPROVED')).toBe('STATUS_CHANGED');
    });
  });

  describe('sectionForField / canal', () => {
    it('deduce la sección desde el campo', () => {
      expect(sectionForField('title')).toBe('Información básica');
      expect(sectionForField('bedrooms')).toBe('Características');
      expect(sectionForField('latitude')).toBe('Ubicación');
      expect(sectionForField('seoTitle')).toBe('SEO y marketing');
      expect(sectionForField('mainImageUrl')).toBe('Multimedia');
      expect(sectionForField('desconocido')).toBeUndefined();
    });

    it('canal: staff = backoffice, comunidad = portal, sin dato = sistema', () => {
      expect(channelFromUser({ authAudience: 'staff' })).toBe('BACKOFFICE');
      expect(channelFromUser({ authAudience: 'community' })).toBe('PORTAL');
      expect(channelFromUser({ role: 'AGENT' })).toBe('BACKOFFICE');
      expect(channelFromUser({ role: 'COMMUNITY' })).toBe('PORTAL');
      expect(channelFromUser(undefined)).toBe('SYSTEM');
    });

    it('historyContextFromRequest toma usuario y canal del token y deja pisar campos', () => {
      const req = { user: { id: 'u9', role: 'AGENT', authAudience: 'staff' } };
      expect(historyContextFromRequest(req)).toEqual({ userId: 'u9', channel: 'BACKOFFICE' });
      expect(historyContextFromRequest(req, { section: 'X' })).toMatchObject({ section: 'X' });
      expect(historyContextFromRequest({})).toEqual({ userId: undefined, channel: 'SYSTEM' });
    });

    it('buildSource: la sección del contexto manda sobre la deducida', () => {
      expect(buildSource({ channel: 'PORTAL' }, 'Ubicación')).toEqual({ channel: 'PORTAL', section: 'Ubicación' });
      expect(buildSource({ channel: 'PORTAL', section: 'Forzada' }, 'Ubicación').section).toBe('Forzada');
      expect(buildSource({ channel: 'CONTRACT', ref: 'CT-1' })).toEqual({ channel: 'CONTRACT', ref: 'CT-1' });
      expect(buildSource(undefined)).toEqual({ channel: 'SYSTEM' });
    });
  });

  describe('diffProperty', () => {
    const current = {
      title: 'Casa',
      price: '100000000.00',
      currencyPrice: 'CLP',
      status: 'INACTIVE',
      otherFeatures: ['POOL'],
      address: null,
      latitude: null,
      longitude: null,
      description: 'Texto',
    };

    it('no registra lo que no cambió (incluida una lista idéntica)', () => {
      const out = diffProperty(
        current,
        { title: ' Casa ', price: 100000000, otherFeatures: ['POOL'], description: 'Texto' },
        ctx,
        NOW,
      );
      expect(out).toEqual([]);
    });

    it('lista vacía contra null no es un cambio', () => {
      expect(diffProperty({ otherFeatures: null }, { otherFeatures: [] }, ctx, NOW)).toEqual([]);
    });

    it('ignora campos que no se siguen (location, multimedia, notas, etc.)', () => {
      const out = diffProperty(
        current,
        { location: { lat: 1, lng: 2 }, multimedia: ['x'], internalNotes: 'x', lastModifiedAt: new Date() } as any,
        ctx,
        NOW,
      );
      expect(out).toEqual([]);
    });

    it('un cambio completo: entradas con valor anterior/nuevo, autor, origen y mismo groupId', () => {
      const out = diffProperty(
        current,
        { title: 'Casa nueva', address: 'Calle 1', latitude: -33.5, longitude: -70.7 },
        ctx,
        NOW,
        'grp-1',
      );
      expect(out.map((e) => e.field)).toEqual(['title', 'address', 'latitude', 'longitude']);
      expect(new Set(out.map((e) => e.groupId))).toEqual(new Set(['grp-1']));
      expect(out[0]).toEqual({
        timestamp: NOW,
        changedBy: 'u1',
        field: 'title',
        previousValue: 'Casa',
        newValue: 'Casa nueva',
        kind: 'UPDATED',
        source: { channel: 'BACKOFFICE', section: 'Información básica' },
        groupId: 'grp-1',
      });
      expect(out.slice(1).map((e) => e.source?.section)).toEqual(['Ubicación', 'Ubicación', 'Ubicación']);
      // lo vacío se guarda como null
      expect(out[1].previousValue).toBeNull();
    });

    it('genera un groupId distinto por operación cuando no se da', () => {
      const a = diffProperty(current, { title: 'A' }, ctx, NOW);
      const b = diffProperty(current, { title: 'B' }, ctx, NOW);
      expect(a[0].groupId).toEqual(expect.any(String));
      expect(a[0].groupId).not.toBe(b[0].groupId);
    });

    it('estado: publicación, despublicación y cambio de estado', () => {
      expect(diffProperty(current, { status: 'PUBLISHED' }, ctx, NOW)[0].kind).toBe('PUBLISHED');
      expect(diffProperty({ status: 'PUBLISHED' }, { status: 'INACTIVE' }, ctx, NOW)[0].kind).toBe('UNPUBLISHED');
      expect(diffProperty({ status: 'PUBLISHED' }, { status: 'SOLD' }, ctx, NOW)[0].kind).toBe('STATUS_CHANGED');
    });

    it('precio: guarda la moneda; si cambia junto con el precio guarda también la anterior', () => {
      const same = diffProperty(current, { price: 120000000 }, ctx, NOW)[0];
      expect(same).toMatchObject({ previousValue: '100000000.00', newValue: 120000000, unit: 'CLP' });
      expect(same.previousUnit).toBeUndefined();

      const switched = diffProperty(current, { price: 3500, currencyPrice: 'UF' }, ctx, NOW);
      const price = switched.find((e) => e.field === 'price')!;
      expect(price).toMatchObject({ unit: 'UF', previousUnit: 'CLP' });
    });

    it('sin usuario el autor es "system"', () => {
      expect(diffProperty(current, { title: 'X' }, undefined, NOW)[0]).toMatchObject({
        changedBy: 'system',
        source: { channel: 'SYSTEM', section: 'Información básica' },
      });
    });

    it('la sección del contexto fuerza el origen de todas las entradas', () => {
      const out = diffProperty(current, { title: 'X', address: 'Y' }, { ...ctx, section: 'Solicitud pública' }, NOW);
      expect(out.map((e) => e.source?.section)).toEqual(['Solicitud pública', 'Solicitud pública']);
    });
  });

  describe('eventEntry', () => {
    it('arma un evento que no es cambio de campo', () => {
      const e = eventEntry(
        { field: 'multimedia', kind: 'MEDIA', newValue: 'Se agregaron 2 imágenes', section: 'Multimedia' },
        ctx,
        NOW,
        'g',
      );
      expect(e).toEqual({
        timestamp: NOW,
        changedBy: 'u1',
        field: 'multimedia',
        previousValue: null,
        newValue: 'Se agregaron 2 imágenes',
        kind: 'MEDIA',
        source: { channel: 'BACKOFFICE', section: 'Multimedia' },
        groupId: 'g',
      });
    });
  });

  describe('appendPropertyHistory', () => {
    it('agrega todo en una sola sentencia SQL atómica', async () => {
      const query = jest.fn().mockResolvedValue(undefined);
      const entries = [
        eventEntry({ field: 'a', kind: 'UPDATED' }, ctx, NOW, 'g'),
        eventEntry({ field: 'b', kind: 'UPDATED' }, ctx, NOW, 'g'),
      ];
      await appendPropertyHistory({ query }, 'p1', entries);

      expect(query).toHaveBeenCalledTimes(1);
      const [sql, params] = query.mock.calls[0];
      expect(sql).toMatch(/JSON_MERGE_PRESERVE\(COALESCE\(`changeHistory`, JSON_ARRAY\(\)\), CAST\(\? AS JSON\)\)/);
      expect(sql).toMatch(/WHERE `id` = \?/);
      expect(JSON.parse(params[0]).map((e: any) => e.field)).toEqual(['a', 'b']);
      expect(params[1]).toBe('p1');
    });

    it('no hace nada sin entradas o sin id', async () => {
      const query = jest.fn();
      await appendPropertyHistory({ query }, 'p1', []);
      await appendPropertyHistory({ query }, '', [eventEntry({ field: 'a', kind: 'UPDATED' }, ctx)]);
      expect(query).not.toHaveBeenCalled();
    });
  });
});
