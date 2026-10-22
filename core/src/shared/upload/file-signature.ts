import {
  BadRequestException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { MAX_IMAGE_DOCUMENT_UPLOAD_BYTES } from './upload-limits';

/**
 * Validación de tipo de archivo por "magic bytes" (firma real del contenido),
 * sin confiar en el mimetype ni en la extensión que envía el cliente.
 *
 * Se implementa a mano porque `file-type` solo existe como dependencia
 * transitiva ESM y no es usable desde el build CommonJS de core.
 */
export type FileKind =
  | 'jpeg'
  | 'png'
  | 'gif'
  | 'webp'
  | 'heic'
  | 'tiff'
  | 'pdf'
  | 'mp4'
  | 'quicktime'
  | 'webm'
  | 'mpeg'
  | 'ole'
  | 'zip'
  | 'text';

export const IMAGE_KINDS: readonly FileKind[] = ['jpeg', 'png', 'gif', 'webp'];
export const VIDEO_KINDS: readonly FileKind[] = ['mp4', 'quicktime', 'webm', 'mpeg'];

/** /multimedia/upload: imágenes web, HEIC, PDF y video (about-us, slides). */
export const MULTIMEDIA_UPLOAD_KINDS: readonly FileKind[] = [
  ...IMAGE_KINDS,
  'heic',
  'pdf',
  ...VIDEO_KINDS,
];

/** /document/upload-dni: foto o escaneo del carnet. */
export const DNI_UPLOAD_KINDS: readonly FileKind[] = [
  ...IMAGE_KINDS,
  'heic',
  'tiff',
  'pdf',
];

/** /document/upload: PDF, Office (doc/xls/ppt y docx/xlsx/pptx), imágenes y texto. */
export const DOCUMENT_UPLOAD_KINDS: readonly FileKind[] = [
  ...DNI_UPLOAD_KINDS,
  'ole',
  'zip',
  'text',
];

const TEXT_EXTENSIONS = ['.txt', '.csv'];

const OFFICE_ZIP_EXTENSIONS = ['.docx', '.xlsx', '.pptx'];
const OFFICE_OLE_EXTENSIONS = ['.doc', '.xls', '.ppt'];

function startsWith(buf: Buffer, bytes: number[], offset = 0): boolean {
  if (buf.length < offset + bytes.length) return false;
  return bytes.every((b, i) => buf[offset + i] === b);
}

function ascii(buf: Buffer, start: number, end: number): string {
  if (buf.length < end) return '';
  return buf.subarray(start, end).toString('latin1');
}

/** Devuelve el tipo detectado por firma binaria, o null si no se reconoce. */
export function detectFileKind(buffer: Buffer | undefined | null): FileKind | null {
  if (!buffer || buffer.length < 4) return null;
  const buf = buffer;

  if (startsWith(buf, [0xff, 0xd8, 0xff])) return 'jpeg';
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
  if (ascii(buf, 0, 6) === 'GIF87a' || ascii(buf, 0, 6) === 'GIF89a') return 'gif';
  if (ascii(buf, 0, 4) === 'RIFF' && ascii(buf, 8, 12) === 'WEBP') return 'webp';
  if (ascii(buf, 0, 5) === '%PDF-') return 'pdf';
  if (
    startsWith(buf, [0x49, 0x49, 0x2a, 0x00]) ||
    startsWith(buf, [0x4d, 0x4d, 0x00, 0x2a])
  ) {
    return 'tiff';
  }
  if (startsWith(buf, [0x1a, 0x45, 0xdf, 0xa3])) return 'webm';
  if (
    startsWith(buf, [0x00, 0x00, 0x01, 0xba]) ||
    startsWith(buf, [0x00, 0x00, 0x01, 0xb3])
  ) {
    return 'mpeg';
  }
  if (startsWith(buf, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) return 'ole';
  if (startsWith(buf, [0x50, 0x4b, 0x03, 0x04])) return 'zip';

  // Contenedores ISO-BMFF: "....ftyp<brand>"
  if (ascii(buf, 4, 8) === 'ftyp') {
    const brand = ascii(buf, 8, 12);
    if (['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1', 'heim', 'heis'].includes(brand)) {
      return 'heic';
    }
    if (brand === 'qt  ') return 'quicktime';
    return 'mp4';
  }

  return null;
}

function extensionOf(name: string | undefined): string {
  const lower = String(name ?? '').toLowerCase();
  const dot = lower.lastIndexOf('.');
  return dot >= 0 ? lower.slice(dot) : '';
}

function looksLikePlainText(buffer: Buffer): boolean {
  const sample = buffer.subarray(0, 4096);
  return !sample.includes(0x00);
}

export interface UploadedFileLike {
  buffer?: Buffer;
  originalname?: string;
  mimetype?: string;
  size?: number;
}

/**
 * Valida la firma del archivo contra la lista permitida y devuelve el tipo
 * detectado. Lanza 400 si el contenido no corresponde a un tipo permitido o
 * si el mimetype declarado contradice la firma (p.ej. un ejecutable con
 * mimetype image/png, o una imagen declarada como video).
 */
export function assertAllowedFileSignature(
  file: UploadedFileLike,
  allowed: readonly FileKind[],
): FileKind {
  if (!file?.buffer || file.buffer.length === 0) {
    throw new BadRequestException('Archivo vacío o no recibido');
  }

  const ext = extensionOf(file.originalname);
  let kind = detectFileKind(file.buffer);

  if (
    !kind &&
    allowed.includes('text') &&
    TEXT_EXTENSIONS.includes(ext) &&
    looksLikePlainText(file.buffer)
  ) {
    kind = 'text';
  }

  if (!kind || !allowed.includes(kind)) {
    throw new BadRequestException('Tipo de archivo no permitido');
  }

  // Los ZIP / OLE solo se aceptan como documentos Office reconocibles.
  if (kind === 'zip' && !OFFICE_ZIP_EXTENSIONS.includes(ext)) {
    throw new BadRequestException('Tipo de archivo no permitido');
  }
  if (kind === 'ole' && !OFFICE_OLE_EXTENSIONS.includes(ext)) {
    throw new BadRequestException('Tipo de archivo no permitido');
  }

  const declared = String(file.mimetype ?? '').toLowerCase();
  const isImageKind = [...IMAGE_KINDS, 'heic', 'tiff'].includes(kind);
  const isVideoKind = VIDEO_KINDS.includes(kind);
  if (
    declared &&
    ((isImageKind && declared.startsWith('video/')) ||
      (isVideoKind && declared.startsWith('image/')) ||
      (!isImageKind && !isVideoKind && (declared.startsWith('image/') || declared.startsWith('video/'))))
  ) {
    throw new BadRequestException('El tipo declarado no coincide con el contenido del archivo');
  }

  return kind;
}

/**
 * Para endpoints que aceptan video con límite multer alto: las imágenes y
 * documentos siguen limitados a 20 MB.
 */
export function assertNonVideoSizeLimit(
  file: UploadedFileLike,
  kind: FileKind,
  maxBytes: number = MAX_IMAGE_DOCUMENT_UPLOAD_BYTES,
): void {
  if (VIDEO_KINDS.includes(kind)) return;
  const size = file.size ?? file.buffer?.length ?? 0;
  if (size > maxBytes) {
    throw new PayloadTooLargeException(
      `El archivo supera el máximo permitido de ${Math.round(maxBytes / 1024 / 1024)} MB`,
    );
  }
}
