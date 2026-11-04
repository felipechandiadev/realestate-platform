import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  InternalNote,
  MAX_INTERNAL_NOTE_LENGTH,
  MAX_INTERNAL_NOTES_PER_PROPERTY,
} from '../domain/internal-note';

/** Valida y limpia el texto de una nota. */
export function normalizeNoteText(raw: unknown): string {
  if (typeof raw !== 'string') {
    throw new BadRequestException('La nota debe ser texto');
  }
  const text = raw.trim();
  if (!text) {
    throw new BadRequestException('La nota no puede estar vacía');
  }
  if (text.length > MAX_INTERNAL_NOTE_LENGTH) {
    throw new BadRequestException(
      `La nota no puede superar los ${MAX_INTERNAL_NOTE_LENGTH} caracteres`,
    );
  }
  return text;
}

/** Arma una nota nueva (sin agregarla a ninguna lista). */
export function buildInternalNote(
  input: { text: unknown; authorId: string | null; authorName: string },
  now: Date = new Date(),
  id: string = randomUUID(),
): InternalNote {
  return {
    id,
    text: normalizeNoteText(input.text),
    authorId: input.authorId,
    authorName: input.authorName,
    createdAt: now.toISOString(),
  };
}

/** Devuelve la lista (copia) o [] si la columna está vacía o corrupta. */
export function readNotes(raw: unknown): InternalNote[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (n): n is InternalNote =>
      !!n && typeof n.id === 'string' && typeof n.text === 'string',
  );
}

/** Agrega una nota al final. Respeta el máximo por propiedad. */
export function appendNote(
  existing: unknown,
  note: InternalNote,
): InternalNote[] {
  const notes = readNotes(existing);
  if (notes.length >= MAX_INTERNAL_NOTES_PER_PROPERTY) {
    throw new BadRequestException(
      `Se alcanzó el máximo de ${MAX_INTERNAL_NOTES_PER_PROPERTY} notas por propiedad`,
    );
  }
  return [...notes, note];
}

/**
 * Quita una nota. Solo la puede borrar su autor o un ADMIN
 * (las notas migradas sin autor solo las borra un ADMIN).
 */
export function removeNote(
  existing: unknown,
  noteId: string,
  user: { id?: string; role?: string },
): InternalNote[] {
  const notes = readNotes(existing);
  const target = notes.find((n) => n.id === noteId);
  if (!target) {
    throw new NotFoundException('Nota no encontrada');
  }
  const isAdmin = user.role === 'ADMIN';
  const isAuthor = !!user.id && target.authorId === user.id;
  if (!isAdmin && !isAuthor) {
    throw new ForbiddenException('Solo el autor o un administrador puede eliminar la nota');
  }
  return notes.filter((n) => n.id !== noteId);
}
