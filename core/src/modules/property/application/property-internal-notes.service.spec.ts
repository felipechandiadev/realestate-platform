import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Property } from '../domain/property.entity';
import { InternalNote } from '../domain/internal-note';
import { PropertyService } from './property.service';

/** Servicio sin DI: solo se asignan las dependencias que usan las notas internas. */
function makeService(opts: {
  property?: Partial<Property> | null;
  user?: { id: string; role: string; name: string; email: string } | null;
  createUseCase?: { execute: jest.Mock };
}) {
  const em = {
    findOne: jest.fn().mockResolvedValue(opts.property ?? null),
    update: jest.fn().mockResolvedValue(undefined),
  };
  const manager = {
    transaction: jest.fn(async (cb: (em: unknown) => Promise<unknown>) => cb(em)),
  };
  const propertyRepository = {
    manager,
    findOne: jest.fn().mockResolvedValue(opts.property ?? null),
  };
  const userRepository = { findOne: jest.fn().mockResolvedValue(opts.user ?? null) };
  const service = Object.create(PropertyService.prototype) as PropertyService;
  Object.assign(service, {
    propertyRepository,
    userRepository,
    createPropertyUseCase: opts.createUseCase ?? { execute: jest.fn() },
  });
  return { service, em, manager, propertyRepository, userRepository };
}

const staffUser = { id: 'u1', role: 'AGENT', name: 'Ana Pérez', email: 'ana@re.cl' };
const existing = (over: Partial<InternalNote> = {}): InternalNote => ({
  id: 'old',
  text: 'Nota previa',
  authorId: 'u2',
  authorName: 'Luis',
  createdAt: '2026-11-01T10:00:00.000Z',
  ...over,
});

describe('PropertyService · notas internas', () => {
  describe('listInternalNotes', () => {
    it('devuelve las notas guardadas', async () => {
      const { service } = makeService({ property: { id: 'p1', internalNotesLog: [existing()] } });
      await expect(service.listInternalNotes('p1')).resolves.toEqual([existing()]);
    });

    it('[] si la propiedad aún no tiene notas', async () => {
      const { service } = makeService({ property: { id: 'p1', internalNotesLog: null } });
      await expect(service.listInternalNotes('p1')).resolves.toEqual([]);
    });

    it('404 si la propiedad no existe', async () => {
      const { service } = makeService({ property: null });
      await expect(service.listInternalNotes('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addInternalNote', () => {
    it('agrega la nota al final, con el autor sacado de la base, dentro de una transacción con bloqueo', async () => {
      const { service, em, manager } = makeService({
        property: { id: 'p1', internalNotesLog: [existing()] },
        user: staffUser,
      });

      const note = await service.addInternalNote('p1', '  Llamar al dueño  ', { id: 'u1' });

      expect(note).toMatchObject({ text: 'Llamar al dueño', authorId: 'u1', authorName: 'Ana Pérez' });
      expect(note.id).toEqual(expect.any(String));
      expect(new Date(note.createdAt).toString()).not.toBe('Invalid Date');
      expect(manager.transaction).toHaveBeenCalledTimes(1);
      expect(em.findOne).toHaveBeenCalledWith(
        Property,
        expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
      );
      const [, id, patch] = em.update.mock.calls[0];
      expect(id).toBe('p1');
      expect((patch as { internalNotesLog: InternalNote[] }).internalNotesLog.map((n) => n.text)).toEqual([
        'Nota previa',
        'Llamar al dueño',
      ]);
    });

    it('crea la lista si la propiedad no tenía', async () => {
      const { service, em } = makeService({ property: { id: 'p1' }, user: staffUser });
      await service.addInternalNote('p1', 'Primera', { id: 'u1' });
      expect(em.update.mock.calls[0][2].internalNotesLog).toHaveLength(1);
    });

    it('usa el email si el usuario no tiene nombre', async () => {
      const { service } = makeService({
        property: { id: 'p1' },
        user: { ...staffUser, name: '', email: 'ana@re.cl' },
      });
      const note = await service.addInternalNote('p1', 'x', { id: 'u1' });
      expect(note.authorName).toBe('ana@re.cl');
    });

    it('texto vacío -> 400 y no toca la base', async () => {
      const { service, manager } = makeService({ property: { id: 'p1' }, user: staffUser });
      await expect(service.addInternalNote('p1', '   ', { id: 'u1' })).rejects.toThrow(
        BadRequestException,
      );
      expect(manager.transaction).not.toHaveBeenCalled();
    });

    it('propiedad inexistente -> 404 y no escribe', async () => {
      const { service, em } = makeService({ property: null, user: staffUser });
      await expect(service.addInternalNote('nope', 'x', { id: 'u1' })).rejects.toThrow(
        NotFoundException,
      );
      expect(em.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteInternalNote', () => {
    it('el autor borra su nota y se conservan las demás', async () => {
      const mine = existing({ id: 'mine', authorId: 'u1' });
      const other = existing({ id: 'other', authorId: 'u2' });
      const { service, em } = makeService({ property: { id: 'p1', internalNotesLog: [mine, other] } });

      await service.deleteInternalNote('p1', 'mine', { id: 'u1', role: 'AGENT' });

      expect(em.update.mock.calls[0][2]).toEqual({ internalNotesLog: [other] });
    });

    it('al borrar la última nota la columna queda en null', async () => {
      const only = existing({ id: 'only', authorId: 'u1' });
      const { service, em } = makeService({ property: { id: 'p1', internalNotesLog: [only] } });
      await service.deleteInternalNote('p1', 'only', { id: 'u1', role: 'AGENT' });
      expect(em.update.mock.calls[0][2]).toEqual({ internalNotesLog: null });
    });

    it('un agente no puede borrar la nota de otro (403) y no se escribe nada', async () => {
      const { service, em } = makeService({
        property: { id: 'p1', internalNotesLog: [existing({ id: 'x', authorId: 'u2' })] },
      });
      await expect(
        service.deleteInternalNote('p1', 'x', { id: 'u1', role: 'AGENT' }),
      ).rejects.toThrow(ForbiddenException);
      expect(em.update).not.toHaveBeenCalled();
    });

    it('un ADMIN sí puede', async () => {
      const { service, em } = makeService({
        property: { id: 'p1', internalNotesLog: [existing({ id: 'x', authorId: 'u2' })] },
      });
      await service.deleteInternalNote('p1', 'x', { id: 'admin', role: 'ADMIN' });
      expect(em.update).toHaveBeenCalledTimes(1);
    });

    it('nota o propiedad inexistente -> 404', async () => {
      const a = makeService({ property: { id: 'p1', internalNotesLog: [] } });
      await expect(a.service.deleteInternalNote('p1', 'zzz', { role: 'ADMIN' })).rejects.toThrow(
        NotFoundException,
      );
      const b = makeService({ property: null });
      await expect(b.service.deleteInternalNote('nope', 'x', { role: 'ADMIN' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create · nota inicial', () => {
    const run = async (dto: Record<string, unknown>, creatorId: string | undefined, user: any) => {
      const execute = jest.fn().mockResolvedValue({ id: 'new' });
      const { service } = makeService({ user, createUseCase: { execute } });
      await service.create(dto, creatorId);
      return execute.mock.calls[0][0] as Record<string, any>;
    };

    it('un staff que envía texto genera la primera nota y no se guarda el texto suelto', async () => {
      const saved = await run({ title: 'Casa', internalNotes: ' Revisar escritura ' }, 'u1', staffUser);
      expect(saved.internalNotes).toBeUndefined();
      expect(saved.internalNotesLog).toHaveLength(1);
      expect(saved.internalNotesLog[0]).toMatchObject({
        text: 'Revisar escritura',
        authorId: 'u1',
        authorName: 'Ana Pérez',
      });
    });

    it('sin texto no hay notas', async () => {
      const saved = await run({ title: 'Casa', internalNotes: '  ' }, 'u1', staffUser);
      expect(saved.internalNotesLog).toBeUndefined();
    });

    it('un usuario que no es staff no puede dejar notas ni inyectar el listado', async () => {
      const saved = await run(
        { title: 'Casa', internalNotes: 'hola', internalNotesLog: [{ id: 'x', text: 'inyectada' }] },
        'c1',
        { id: 'c1', role: 'COMMUNITY', name: 'Cliente', email: 'c@x.cl' },
      );
      expect(saved.internalNotes).toBeUndefined();
      expect(saved.internalNotesLog).toBeUndefined();
      expect(saved.title).toBe('Casa');
    });

    it('una solicitud anónima tampoco puede inyectar notas', async () => {
      const saved = await run(
        { title: 'Casa', internalNotesLog: [{ id: 'x', text: 'inyectada' }] },
        undefined,
        null,
      );
      expect(saved.internalNotesLog).toBeUndefined();
    });
  });
});
