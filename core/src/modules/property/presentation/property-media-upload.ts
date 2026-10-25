import { BadRequestException } from '@nestjs/common';
import { mkdirSync, promises as fsPromises } from 'fs';
import { diskStorage } from 'multer';
import { tmpdir } from 'os';
import { extname, join } from 'path';

/** Carpeta temporal privada: los archivos nunca quedan bajo `public/`. */
export const PROPERTY_UPLOAD_TMP_DIR = join(
  tmpdir(),
  'realestate-property-uploads',
);

const IMAGE_MIMES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];
// Solo formatos que reproducen todos los navegadores. MOV (HEVC de iPhone) y MPEG
// se ven en negro en Chrome/Android: se rechazan con un mensaje claro.
const VIDEO_MIMES = ['video/mp4', 'video/webm'];
const UNSUPPORTED_VIDEO_MIMES = ['video/quicktime', 'video/mpeg'];

export const UNSUPPORTED_VIDEO_MESSAGE =
  'Formato de video no compatible con todos los navegadores (MOV/MPEG). Expórtalo como MP4 e intenta de nuevo.';

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 70 * 1024 * 1024;

type UploadedFile = Pick<Express.Multer.File, 'mimetype' | 'size'> & {
  path?: string;
};

/** Opciones de Multer para multimedia de propiedades. */
export function propertyMediaUploadOptions(maxFiles: number) {
  return {
    storage: diskStorage({
      destination: (_req, _file, callback) => {
        mkdirSync(PROPERTY_UPLOAD_TMP_DIR, { recursive: true });
        callback(null, PROPERTY_UPLOAD_TMP_DIR);
      },
      filename: (_req, file, callback) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        callback(
          null,
          `${uniqueSuffix}${extname(file.originalname).toLowerCase()}`,
        );
      },
    }),
    limits: { fileSize: MAX_VIDEO_BYTES, files: maxFiles },
    fileFilter: (
      _req: unknown,
      file: Express.Multer.File,
      callback: (error: Error | null, accept: boolean) => void,
    ) => {
      // Multer aún no conoce el tamaño aquí; se valida en assertPropertyMediaSizes.
      if (UNSUPPORTED_VIDEO_MIMES.includes(file.mimetype)) {
        callback(new BadRequestException(UNSUPPORTED_VIDEO_MESSAGE), false);
        return;
      }
      if (![...IMAGE_MIMES, ...VIDEO_MIMES].includes(file.mimetype)) {
        callback(
          new BadRequestException(
            `Tipo de archivo ${file.mimetype} no permitido`,
          ),
          false,
        );
        return;
      }
      callback(null, true);
    },
  };
}

/** Rechaza imágenes sobre 10 MB (los videos ya quedan acotados a 70 MB por Multer). */
export function assertPropertyMediaSizes(files: UploadedFile[] = []): void {
  const tooBig = files.find(
    (file) =>
      IMAGE_MIMES.includes(file.mimetype) && file.size > MAX_IMAGE_BYTES,
  );
  if (tooBig) {
    throw new BadRequestException(
      'Archivo demasiado grande. Máximo permitido: 10MB para imágenes',
    );
  }
}

/** Borra los archivos temporales de una subida, haya funcionado o no. */
export async function removeUploadedTempFiles(
  files: UploadedFile[] = [],
): Promise<void> {
  await Promise.all(
    files
      .filter((file) => file?.path)
      .map((file) =>
        fsPromises.unlink(file.path as string).catch(() => undefined),
      ),
  );
}
