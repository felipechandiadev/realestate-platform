import { MultimediaType } from '../../multimedia/domain/multimedia.entity';

/** Tipo de multimedia de propiedad según el archivo: video o imagen. */
export function propertyMediaTypeFor(
  mimetype: string | undefined,
): MultimediaType {
  return mimetype?.startsWith('video/')
    ? MultimediaType.PROPERTY_VIDEO
    : MultimediaType.PROPERTY_IMG;
}
