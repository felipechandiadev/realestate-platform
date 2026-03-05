/**
 * Document Types Management Page
 * 
 * Propósito:
 * - Gestionar tipos de documentos disponibles en contratos (categorización)
 * - Definir estructura y campos de cada tipo de documento
 * - Asignar documentos a tipos de contrato (venta, arriendo)
 * - Configurar obligatoriedad y orden de documentos
 * - Mantener templates y esquemas de validación
 * 
 * Funcionalidad:
 * - Server component con async data fetching
 * - CRUD de tipos de documentos
 * - Validación de estructura XML/JSON
 * - Assign campos requeridos y condicionales
 * - Auto-generación de esquemas de validación
 * 
 * Audiencia: Administradores, Legal, Gerentes de operación
 */

import { getDocumentTypes } from '@/features/backoffice/contracts/actions/documentTypes.action';
import { DocumentTypesContent } from '@/features/backoffice/contracts/components/documentTypes/DocumentTypesContent';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DocumentTypesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : undefined;

  const result = await getDocumentTypes({ search });
  const initialDocumentTypes = result.success && result.data ? result.data : [];
  const error = !result.success ? result.error : null;

  return (
    <DocumentTypesContent 
      initialDocumentTypes={initialDocumentTypes} 
      initialSearch={search}
      initialError={error}
    />
  );
}

