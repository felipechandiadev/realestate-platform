import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  MAX_INTERNAL_NOTE_LENGTH,
  MAX_INTERNAL_NOTES_PER_PROPERTY,
  InternalNote,
} from '../domain/internal-note';
import {
  appendNote,
  buildInternalNote,
  normalizeNoteText,
  readNotes,
  removeNote,
} from './internal-notes';

const note = (over: Partial<InternalNote> = {}): InternalNote => ({
  id: 'n1',
  text: 'Texto',
  authorId: 'u1',
  authorName: 'Ana Pérez',
  createdAt: '2026-11-04T12:00:00.000Z',
  ...over,
});

describe('internal-notes', () => {
  describe('normalizeNoteText', () => {
    it('recorta espacios', () => {
      expect(normalizeNoteText('  hola  ')).toBe('hola');
    });

    it.each([['', 'vacía'], ['   \n ', 'solo espacios'], [undefined, 'undefined'], [null, 'null'], [42, 'número']])(
      'rechaza %p (%s)',
      (value: unknown, _label: string) => {
        expect(() => normalizeNoteText(value)).toThrow(BadRequestException);
      },
    );

    it('acepta el largo máximo y rechaza uno más', () => {
      expect(normalizeNoteText('a'.repeat(MAX_INTERNAL_NOTE_LENGTH))).toHaveLength(
        MAX_INTERNAL_NOTE_LENGTH,
      );
      expect(() => normalizeNoteText('a'.repeat(MAX_INTERNAL_NOTE_LENGTH + 1))).toThrow(
        /no puede superar/,
      );
    });
  });

  describe('buildInternalNote', () => {
    it('arma la nota con autor, id y fecha ISO', () => {
      const built = buildInternalNote(
        { text: ' Llamar al dueño ', authorId: 'u1', authorName: 'Ana Pérez' },
        new Date('2026-11-04T15:30:00.000Z'),
        'fixed-id',
      );
      expect(built).toEqual({
        id: 'fixed-id',
        text: 'Llamar al dueño',
        authorId: 'u1',
        authorName: 'Ana Pérez',
        createdAt: '2026-11-04T15:30:00.000Z',
      });
    });

    it('genera ids distintos y valida el texto', () => {
      const a = buildInternalNote({ text: 'a', authorId: null, authorName: 'X' });
      const b = buildInternalNote({ text: 'b', authorId: null, authorName: 'X' });
      expect(a.id).not.toBe(b.id);
      expect(() => buildInternalNote({ text: ' ', authorId: null, authorName: 'X' })).toThrow(
        BadRequestException,
      );
    });
  });

  describe('readNotes', () => {
    it('devuelve [] si la columna está vacía o no es una lista', () => {
      expect(readNotes(null)).toEqual([]);
      expect(readNotes(undefined)).toEqual([]);
      expect(readNotes('texto suelto')).toEqual([]);
      expect(readNotes({ id: 'x' })).toEqual([]);
    });

    it('descarta entradas corruptas y conserva las válidas', () => {
      const ok = note();
      expect(readNotes([ok, null, { id: 5 }, { text: 'sin id' }, 'x'])).toEqual([ok]);
    });
  });

  describe('appendNote', () => {
    it('agrega al final sin modificar la lista original', () => {
      const first = note({ id: 'a' });
      const original = [first];
      const result = appendNote(original, note({ id: 'b' }));
      expect(result.map((n) => n.id)).toEqual(['a', 'b']);
      expect(original).toHaveLength(1);
    });

    it('parte desde cero si no hay notas', () => {
      expect(appendNote(null, note({ id: 'a' }))).toHaveLength(1);
    });

    it('rechaza pasar del máximo por propiedad', () => {
      const full = Array.from({ length: MAX_INTERNAL_NOTES_PER_PROPERTY }, (_, i) =>
        note({ id: `n${i}` }),
      );
      expect(() => appendNote(full, note({ id: 'extra' }))).toThrow(/máximo de/);
      expect(appendNote(full.slice(1), note({ id: 'extra' }))).toHaveLength(
        MAX_INTERNAL_NOTES_PER_PROPERTY,
      );
    });
  });

  describe('removeNote', () => {
    const list = [note({ id: 'a', authorId: 'u1' }), note({ id: 'b', authorId: 'u2' }), note({ id: 'legacy', authorId: null })];

    it('el autor puede borrar su nota', () => {
      expect(removeNote(list, 'a', { id: 'u1', role: 'AGENT' }).map((n) => n.id)).toEqual([
        'b',
        'legacy',
      ]);
    });

    it('un ADMIN puede borrar la nota de otro y las migradas sin autor', () => {
      expect(removeNote(list, 'b', { id: 'admin', role: 'ADMIN' })).toHaveLength(2);
      expect(removeNote(list, 'legacy', { id: 'admin', role: 'ADMIN' })).toHaveLength(2);
    });

    it('un agente no puede borrar la nota de otro ni las migradas', () => {
      expect(() => removeNote(list, 'b', { id: 'u1', role: 'AGENT' })).toThrow(ForbiddenException);
      expect(() => removeNote(list, 'legacy', { id: 'u1', role: 'AGENT' })).toThrow(
        ForbiddenException,
      );
    });

    it('sin usuario identificado no borra nada', () => {
      expect(() => removeNote(list, 'legacy', {})).toThrow(ForbiddenException);
    });

    it('nota inexistente -> 404, sin importar el rol', () => {
      expect(() => removeNote(list, 'zzz', { id: 'admin', role: 'ADMIN' })).toThrow(
        NotFoundException,
      );
      expect(() => removeNote(null, 'a', { id: 'admin', role: 'ADMIN' })).toThrow(NotFoundException);
    });

    it('no modifica la lista original', () => {
      removeNote(list, 'a', { id: 'u1' });
      expect(list).toHaveLength(3);
    });
  });
});
