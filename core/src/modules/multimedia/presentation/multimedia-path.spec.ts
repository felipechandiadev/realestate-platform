import { BadRequestException } from '@nestjs/common';
import { normalizeRelativeFilePath } from './multimedia-upload.controller';

describe('normalizeRelativeFilePath (anti path traversal)', () => {
  it('acepta rutas relativas normales (string o segmentos)', () => {
    expect(normalizeRelativeFilePath('properties/img/a.jpg')).toBe(
      'properties/img/a.jpg',
    );
    expect(normalizeRelativeFilePath(['properties', 'img', 'a.jpg'])).toBe(
      'properties/img/a.jpg',
    );
    expect(normalizeRelativeFilePath('properties/./img//a.jpg')).toBe(
      'properties/img/a.jpg',
    );
  });

  it.each([
    '../.env',
    'properties/../../etc/passwd',
    '%2e%2e/secret',
    '/etc/passwd',
    'C:/windows/win.ini',
    '..\\\\keys\\\\private.pem',
    '',
  ])('rechaza %p', (raw) => {
    expect(() => normalizeRelativeFilePath(raw)).toThrow(BadRequestException);
  });
});
