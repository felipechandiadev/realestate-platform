/** Tests unitarios del validador de magic bytes (sin servidor). */
import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import {
  DNI_UPLOAD_KINDS,
  DOCUMENT_UPLOAD_KINDS,
  MULTIMEDIA_UPLOAD_KINDS,
  assertAllowedFileSignature,
  assertNonVideoSizeLimit,
  detectFileKind,
} from './file-signature';
import { MAX_IMAGE_DOCUMENT_UPLOAD_BYTES } from './upload-limits';

const pad = (head: number[] | Buffer, total = 32) => {
  const h = Buffer.isBuffer(head) ? head : Buffer.from(head);
  return Buffer.concat([h, Buffer.alloc(Math.max(0, total - h.length), 0x20)]);
};
const JPEG = pad([0xff, 0xd8, 0xff, 0xe0]);
const PNG = pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const GIF = pad(Buffer.from('GIF89a'));
const WEBP = pad(
  Buffer.concat([
    Buffer.from('RIFF'),
    Buffer.alloc(4),
    Buffer.from('WEBPVP8 '),
  ]),
);
const PDF = pad(Buffer.from('%PDF-1.7\n'));
const MP4 = pad(
  Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from('ftypisom')]),
);
const MOV = pad(
  Buffer.concat([Buffer.from([0, 0, 0, 0x14]), Buffer.from('ftypqt  ')]),
);
const HEIC = pad(
  Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from('ftypheic')]),
);
const WEBM = pad([0x1a, 0x45, 0xdf, 0xa3]);
const TIFF = pad([0x49, 0x49, 0x2a, 0x00]);
const ZIP = pad([0x50, 0x4b, 0x03, 0x04]);
const OLE = pad([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
const EXE = pad(Buffer.from('MZ\x90\x00'));
const HTML = pad(Buffer.from('<html><script>alert(1)</script></html>'));

const file = (buffer: Buffer, originalname: string, mimetype: string) => ({
  buffer,
  originalname,
  mimetype,
  size: buffer.length,
});

describe('detectFileKind', () => {
  it.each([
    [JPEG, 'jpeg'],
    [PNG, 'png'],
    [GIF, 'gif'],
    [WEBP, 'webp'],
    [PDF, 'pdf'],
    [MP4, 'mp4'],
    [MOV, 'quicktime'],
    [HEIC, 'heic'],
    [WEBM, 'webm'],
    [TIFF, 'tiff'],
    [ZIP, 'zip'],
    [OLE, 'ole'],
  ])('detecta %#', (buf: Buffer, kind: string) => {
    expect(detectFileKind(buf)).toBe(kind);
  });

  it('no reconoce ejecutables, HTML ni buffers vacíos', () => {
    expect(detectFileKind(EXE)).toBeNull();
    expect(detectFileKind(HTML)).toBeNull();
    expect(detectFileKind(Buffer.alloc(0))).toBeNull();
    expect(detectFileKind(undefined)).toBeNull();
  });
});

describe('assertAllowedFileSignature', () => {
  it('/multimedia/upload acepta imágenes, PDF y video reales', () => {
    expect(
      assertAllowedFileSignature(
        file(JPEG, 'a.jpg', 'image/jpeg'),
        MULTIMEDIA_UPLOAD_KINDS,
      ),
    ).toBe('jpeg');
    expect(
      assertAllowedFileSignature(
        file(PNG, 'a.png', 'image/png'),
        MULTIMEDIA_UPLOAD_KINDS,
      ),
    ).toBe('png');
    expect(
      assertAllowedFileSignature(
        file(MP4, 'a.mp4', 'video/mp4'),
        MULTIMEDIA_UPLOAD_KINDS,
      ),
    ).toBe('mp4');
    expect(
      assertAllowedFileSignature(
        file(PDF, 'a.pdf', 'application/pdf'),
        MULTIMEDIA_UPLOAD_KINDS,
      ),
    ).toBe('pdf');
  });

  it('rechaza un ejecutable o HTML disfrazado de imagen', () => {
    expect(() =>
      assertAllowedFileSignature(
        file(EXE, 'foto.jpg', 'image/jpeg'),
        MULTIMEDIA_UPLOAD_KINDS,
      ),
    ).toThrow(BadRequestException);
    expect(() =>
      assertAllowedFileSignature(
        file(HTML, 'foto.png', 'image/png'),
        DNI_UPLOAD_KINDS,
      ),
    ).toThrow(BadRequestException);
  });

  it('rechaza mimetype que contradice el contenido', () => {
    expect(() =>
      assertAllowedFileSignature(
        file(JPEG, 'a.mp4', 'video/mp4'),
        MULTIMEDIA_UPLOAD_KINDS,
      ),
    ).toThrow(BadRequestException);
    expect(() =>
      assertAllowedFileSignature(
        file(PDF, 'a.png', 'image/png'),
        MULTIMEDIA_UPLOAD_KINDS,
      ),
    ).toThrow(BadRequestException);
  });

  it('/document/upload-dni no acepta video ni Office', () => {
    expect(
      assertAllowedFileSignature(
        file(TIFF, 'dni.tif', 'image/tiff'),
        DNI_UPLOAD_KINDS,
      ),
    ).toBe('tiff');
    expect(() =>
      assertAllowedFileSignature(
        file(MP4, 'dni.mp4', 'video/mp4'),
        DNI_UPLOAD_KINDS,
      ),
    ).toThrow(BadRequestException);
    expect(() =>
      assertAllowedFileSignature(
        file(ZIP, 'dni.docx', 'application/zip'),
        DNI_UPLOAD_KINDS,
      ),
    ).toThrow(BadRequestException);
  });

  it('/document/upload acepta Office solo con extensión Office y texto plano .txt', () => {
    expect(
      assertAllowedFileSignature(
        file(
          ZIP,
          'contrato.docx',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ),
        DOCUMENT_UPLOAD_KINDS,
      ),
    ).toBe('zip');
    expect(
      assertAllowedFileSignature(
        file(OLE, 'planilla.xls', 'application/vnd.ms-excel'),
        DOCUMENT_UPLOAD_KINDS,
      ),
    ).toBe('ole');
    expect(
      assertAllowedFileSignature(
        file(Buffer.from('hola mundo'), 'nota.txt', 'text/plain'),
        DOCUMENT_UPLOAD_KINDS,
      ),
    ).toBe('text');
    expect(() =>
      assertAllowedFileSignature(
        file(ZIP, 'archivo.zip', 'application/zip'),
        DOCUMENT_UPLOAD_KINDS,
      ),
    ).toThrow(BadRequestException);
    expect(() =>
      assertAllowedFileSignature(
        file(Buffer.from('a\u0000b'), 'nota.txt', 'text/plain'),
        DOCUMENT_UPLOAD_KINDS,
      ),
    ).toThrow(BadRequestException);
    expect(() =>
      assertAllowedFileSignature(
        file(HTML, 'pagina.html', 'text/html'),
        DOCUMENT_UPLOAD_KINDS,
      ),
    ).toThrow(BadRequestException);
  });

  it('rechaza archivo vacío o ausente', () => {
    expect(() =>
      assertAllowedFileSignature({} as any, DOCUMENT_UPLOAD_KINDS),
    ).toThrow(BadRequestException);
    expect(() =>
      assertAllowedFileSignature(
        file(Buffer.alloc(0), 'a.pdf', 'application/pdf'),
        DOCUMENT_UPLOAD_KINDS,
      ),
    ).toThrow(BadRequestException);
  });
});

describe('assertNonVideoSizeLimit', () => {
  it('imágenes/documentos > 20 MB se rechazan; video no', () => {
    const big = { size: MAX_IMAGE_DOCUMENT_UPLOAD_BYTES + 1 };
    expect(() => assertNonVideoSizeLimit(big, 'jpeg')).toThrow(
      PayloadTooLargeException,
    );
    expect(() => assertNonVideoSizeLimit(big, 'pdf')).toThrow(
      PayloadTooLargeException,
    );
    expect(() => assertNonVideoSizeLimit(big, 'mp4')).not.toThrow();
    expect(() => assertNonVideoSizeLimit({ size: 1024 }, 'png')).not.toThrow();
  });
});
