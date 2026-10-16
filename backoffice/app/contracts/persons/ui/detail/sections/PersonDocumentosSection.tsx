'use client';

import PersonDocumentsList from '../../PersonDocumentsList';

type PersonDocumentosSectionProps = {
  personId: string;
};

export function PersonDocumentosSection({ personId }: PersonDocumentosSectionProps) {
  return (
    <section data-test-id="person-detail-documentos-section">
      <PersonDocumentsList personId={personId} />
    </section>
  );
}
