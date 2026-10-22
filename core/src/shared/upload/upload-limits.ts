/**
 * Límites de tamaño para subidas multipart (multer).
 *
 * - Imágenes y documentos: 20 MB.
 * - Endpoints que aceptan video (propiedades, slides, multimedia genérica): 70 MB,
 *   alineado con el `client_max_body_size` de nginx.
 */
export const MAX_IMAGE_DOCUMENT_UPLOAD_BYTES = 20 * 1024 * 1024;
export const MAX_VIDEO_UPLOAD_BYTES = 70 * 1024 * 1024;

/** Opciones multer por defecto para imágenes/documentos (20 MB). */
export const DEFAULT_UPLOAD_OPTIONS = {
  limits: { fileSize: MAX_IMAGE_DOCUMENT_UPLOAD_BYTES },
};

/** Opciones multer para endpoints que pueden recibir video (70 MB). */
export const VIDEO_UPLOAD_OPTIONS = {
  limits: { fileSize: MAX_VIDEO_UPLOAD_BYTES },
};
