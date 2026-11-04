/** Nota interna de una propiedad (solo visible para el staff). */
export interface InternalNote {
  id: string;
  text: string;
  /** Usuario que la escribió; null en notas migradas desde el campo de texto antiguo. */
  authorId: string | null;
  authorName: string;
  /** ISO 8601 (UTC). */
  createdAt: string;
}

/** Largo máximo de una nota. */
export const MAX_INTERNAL_NOTE_LENGTH = 2000;
/** Máximo de notas por propiedad (acota el tamaño de la columna JSON). */
export const MAX_INTERNAL_NOTES_PER_PROPERTY = 200;
