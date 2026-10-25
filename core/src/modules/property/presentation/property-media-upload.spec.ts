import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  MAX_IMAGE_BYTES,
  PROPERTY_UPLOAD_TMP_DIR,
  UNSUPPORTED_VIDEO_MESSAGE,
  assertPropertyMediaSizes,
  propertyMediaUploadOptions,
  removeUploadedTempFiles,
} from './property-media-upload';

describe('property-media-upload', () => {
  it('usa una carpeta temporal fuera de public/', () => {
    expect(PROPERTY_UPLOAD_TMP_DIR).not.toContain('public');
  });

  it('rechaza imágenes sobre 10 MB y acepta videos grandes', () => {
    expect(() =>
      assertPropertyMediaSizes([
        { mimetype: 'image/jpeg', size: MAX_IMAGE_BYTES + 1 },
      ]),
    ).toThrow(BadRequestException);
    expect(() =>
      assertPropertyMediaSizes([
        { mimetype: 'image/png', size: MAX_IMAGE_BYTES },
        { mimetype: 'video/mp4', size: 60 * 1024 * 1024 },
      ]),
    ).not.toThrow();
    expect(() => assertPropertyMediaSizes(undefined)).not.toThrow();
  });

  it('filtra por tipo MIME', () => {
    const { fileFilter } = propertyMediaUploadOptions(10);
    const cb = jest.fn();
    fileFilter(
      {},
      { mimetype: 'application/x-msdownload' } as Express.Multer.File,
      cb,
    );
    expect(cb).toHaveBeenCalledWith(expect.any(BadRequestException), false);

    const ok = jest.fn();
    fileFilter({}, { mimetype: 'image/webp' } as Express.Multer.File, ok);
    expect(ok).toHaveBeenCalledWith(null, true);
  });

  it('rechaza MOV y MPEG con un mensaje que indica exportar a MP4', () => {
    const { fileFilter } = propertyMediaUploadOptions(10);
    for (const mimetype of ['video/quicktime', 'video/mpeg']) {
      const cb = jest.fn();
      fileFilter({}, { mimetype } as Express.Multer.File, cb);
      const [error, accepted] = cb.mock.calls[0] as [Error, boolean];
      expect(accepted).toBe(false);
      expect(error.message).toBe(UNSUPPORTED_VIDEO_MESSAGE);
    }

    const ok = jest.fn();
    fileFilter({}, { mimetype: 'video/mp4' } as Express.Multer.File, ok);
    expect(ok).toHaveBeenCalledWith(null, true);
  });

  it('borra los archivos temporales e ignora los que ya no existen', async () => {
    mkdirSync(PROPERTY_UPLOAD_TMP_DIR, { recursive: true });
    const path = join(PROPERTY_UPLOAD_TMP_DIR, `spec-${Date.now()}.jpg`);
    writeFileSync(path, 'x');

    await removeUploadedTempFiles([
      { mimetype: 'image/jpeg', size: 1, path },
      {
        mimetype: 'image/jpeg',
        size: 1,
        path: join(PROPERTY_UPLOAD_TMP_DIR, 'no-existe.jpg'),
      },
      { mimetype: 'image/jpeg', size: 1 },
    ]);

    expect(existsSync(path)).toBe(false);
  });
});
