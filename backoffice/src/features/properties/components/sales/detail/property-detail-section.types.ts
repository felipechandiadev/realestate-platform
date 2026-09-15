export const PROPERTY_DETAIL_SECTION_IDS = [
  'basica',
  'caracteristicas',
  'ubicacion',
  'multimedia',
  'seo',
  'notas',
  'historial',
] as const;

export type PropertyDetailSectionId = (typeof PROPERTY_DETAIL_SECTION_IDS)[number];

export type PropertyDetailTabItem = {
  id: PropertyDetailSectionId;
  label: string;
};

export const PROPERTY_DETAIL_TABS: PropertyDetailTabItem[] = [
  { id: 'basica', label: 'Información básica' },
  { id: 'caracteristicas', label: 'Características' },
  { id: 'ubicacion', label: 'Localización' },
  { id: 'multimedia', label: 'Multimedia' },
  { id: 'seo', label: 'SEO y marketing' },
  { id: 'notas', label: 'Notas internas' },
  { id: 'historial', label: 'Historial' },
];

export function isPropertyDetailSectionId(value: string): value is PropertyDetailSectionId {
  return (PROPERTY_DETAIL_SECTION_IDS as readonly string[]).includes(value);
}

export function propertyDetailSectionFromHash(hash: string): PropertyDetailSectionId | null {
  const id = hash.replace(/^#/, '').trim();
  return id && isPropertyDetailSectionId(id) ? id : null;
}
