export const CONTRACT_DETAIL_SECTION_IDS = [
  'general',
  'property',
  'participants',
  'financial',
  'payments',
  'documents',
  'history',
] as const;

export type ContractDetailSectionId = (typeof CONTRACT_DETAIL_SECTION_IDS)[number];

export type ContractDetailTabItem = {
  id: ContractDetailSectionId;
  label: string;
};

export const CONTRACT_DETAIL_TABS: ContractDetailTabItem[] = [
  { id: 'general', label: 'General' },
  { id: 'property', label: 'Propiedad' },
  { id: 'participants', label: 'Participantes' },
  { id: 'financial', label: 'Financiero' },
  { id: 'payments', label: 'Pagos' },
  { id: 'documents', label: 'Documentos' },
  { id: 'history', label: 'Historial' },
];

export function isContractDetailSectionId(value: string): value is ContractDetailSectionId {
  return (CONTRACT_DETAIL_SECTION_IDS as readonly string[]).includes(value);
}

export function contractDetailSectionFromHash(hash: string): ContractDetailSectionId | null {
  const id = hash.replace(/^#/, '').trim();
  return id && isContractDetailSectionId(id) ? id : null;
}
