import { MultimediaType } from '../../multimedia/domain/multimedia.entity';
import { propertyMediaTypeFor } from './property-media-type';

describe('propertyMediaTypeFor', () => {
  it('clasifica los videos como PROPERTY_VIDEO', () => {
    expect(propertyMediaTypeFor('video/mp4')).toBe(
      MultimediaType.PROPERTY_VIDEO,
    );
    expect(propertyMediaTypeFor('video/webm')).toBe(
      MultimediaType.PROPERTY_VIDEO,
    );
  });

  it('clasifica imágenes y valores desconocidos como PROPERTY_IMG', () => {
    expect(propertyMediaTypeFor('image/jpeg')).toBe(
      MultimediaType.PROPERTY_IMG,
    );
    expect(propertyMediaTypeFor(undefined)).toBe(MultimediaType.PROPERTY_IMG);
  });
});
