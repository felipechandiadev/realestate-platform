export const PERSON_DETAIL_SECTION_IDS = [
  'datos',
  'identidad',
  'documentos',
] as const;

export type PersonDetailSectionId = (typeof PERSON_DETAIL_SECTION_IDS)[number];

export type PersonDetailTabItem = {
  id: PersonDetailSectionId;
  label: string;
};

export const PERSON_DETAIL_TABS: PersonDetailTabItem[] = [
  { id: 'datos', label: 'Datos' },
  { id: 'identidad', label: 'Identidad' },
  { id: 'documentos', label: 'Documentos' },
];

export function isPersonDetailSectionId(value: string): value is PersonDetailSectionId {
  return (PERSON_DETAIL_SECTION_IDS as readonly string[]).includes(value);
}

export function personDetailSectionFromHash(hash: string): PersonDetailSectionId | null {
  const id = hash.replace(/^#/, '').trim();
  return id && isPersonDetailSectionId(id) ? id : null;
}
