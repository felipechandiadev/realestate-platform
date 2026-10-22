import { portalPublicOrigin, pickShareImage } from './share-metadata';
import { propertyPublicPath } from './share-links';
import type { Property } from './actions';

export function PropertyJsonLd({ property, id }: { property: Property; id: string }) {
  const origin = portalPublicOrigin();
  const url = `${origin}${propertyPublicPath(id)}`;
  const image = pickShareImage(property);
  const operation = property.operationType === 'RENT' ? 'RentAction' : 'BuyAction';

  const data = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url,
    datePosted: property.publishedAt || property.createdAt,
    image: image?.url ? [image.url] : undefined,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: property.currencyPrice === 'UF' ? 'CLF' : 'CLP',
      availability: 'https://schema.org/InStock',
      businessFunction: `https://schema.org/${operation}`,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.city,
      addressRegion: property.state,
      streetAddress: property.address,
      addressCountry: 'CL',
    },
    floorSize:
      property.builtSquareMeters != null
        ? {
            '@type': 'QuantitativeValue',
            value: property.builtSquareMeters,
            unitCode: 'MTK',
          }
        : undefined,
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
