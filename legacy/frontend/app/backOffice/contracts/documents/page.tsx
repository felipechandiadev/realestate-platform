/**
 * Documents Repository Management Page
 * 
 * Propósito:
 * - Gestionar repositorio centralizado de documentos digitalizados
 * - Almacenar y organizar documentos de contratos, propiedades, personas
 * - Búsqueda y filtrado por tipo, fecha, contrato, persona
 * - Descarga, visualización y validación de documentos
 * - Control de versiones de documentos (histórico)
 * 
 * Funcionalidad:
 * - Server component: pagination, search, filtering por tipo
 * - Fetcha lista de documentos desde action
 * - Carga de documentos types para categorización
 * - Renderiza DataGrid con acciones (descargar, ver, eliminar)
 * - Error handling para fallos de carga
 * 
 * Audiencia: Administradores, Abogados, Gerentes de operación
 */

import DocumentsDataGrid from '@/app/backOffice/contracts/documents/ui/DocumentsDataGrid';
import { listDocuments } from '@/features/backoffice/contracts/actions/documents.action';
import { getDocumentTypes } from '@/features/backoffice/contracts/actions/documentTypes.action';
import type { DocumentEntity } from '@/features/backoffice/contracts/actions/documents.action';
import type { DocumentType } from '@/features/backoffice/contracts/actions/documentTypes.action';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    limit?: string;
  }>;
}

function resolveDocumentsPayload(payload: unknown): {
  rows: DocumentEntity[];
  total: number;
} {
  if (!payload) {
    return { rows: [], total: 0 };
  }

  if (Array.isArray(payload)) {
    return { rows: payload as DocumentEntity[], total: payload.length };
  }

  if (
    typeof payload === 'object' &&
    payload !== null &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    const { data, total } = payload as { data: DocumentEntity[]; total?: number };
    return { rows: data, total: typeof total === 'number' ? total : data.length };
  }

  return { rows: [], total: 0 };
}

export default async function DocumentsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const search = typeof params.search === 'string' ? params.search : '';
  const page = Number.parseInt(params.page ?? '1', 10) || 1;
  const limit = Number.parseInt(params.limit ?? '25', 10) || 25;

  const [documentsResult, typesResult] = await Promise.all([
    listDocuments({ search, page, limit }),
    getDocumentTypes(),
  ]);

  const { rows, total } = documentsResult.success && documentsResult.data
    ? resolveDocumentsPayload(documentsResult.data)
    : { rows: [], total: 0 };

  const documentTypes = typesResult.success && typesResult.data ? typesResult.data : [];
  const errorMessage = documentsResult.success ? undefined : documentsResult.error;

  return (
    <div className="p-4">
      <DocumentsDataGrid
        rows={rows}
        totalRows={total}
        documentTypes={Array.isArray(documentTypes) ? documentTypes : []}
        errorMessage={errorMessage}
      />
    </div>
  );
}
