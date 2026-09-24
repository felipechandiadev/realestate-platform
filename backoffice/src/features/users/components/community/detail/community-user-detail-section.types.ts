export const COMMUNITY_USER_DETAIL_SECTION_IDS = [
  'cuenta',
  'perfil',
  'identidad',
  'favoritos',
  'interes',
  'documentos',
  'actividad',
] as const;

export type CommunityUserDetailSectionId =
  (typeof COMMUNITY_USER_DETAIL_SECTION_IDS)[number];

export type CommunityUserDetailTabItem = {
  id: CommunityUserDetailSectionId;
  label: string;
};

export const COMMUNITY_USER_DETAIL_TABS: CommunityUserDetailTabItem[] = [
  { id: 'cuenta', label: 'Cuenta' },
  { id: 'perfil', label: 'Perfil' },
  { id: 'identidad', label: 'Identidad' },
  { id: 'favoritos', label: 'Favoritos' },
  { id: 'interes', label: 'Interés' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'actividad', label: 'Actividad' },
];

export function isCommunityUserDetailSectionId(
  value: string,
): value is CommunityUserDetailSectionId {
  return (COMMUNITY_USER_DETAIL_SECTION_IDS as readonly string[]).includes(value);
}

export function communityUserDetailSectionFromHash(
  hash: string,
): CommunityUserDetailSectionId | null {
  const id = hash.replace(/^#/, '').trim();
  return id && isCommunityUserDetailSectionId(id) ? id : null;
}
