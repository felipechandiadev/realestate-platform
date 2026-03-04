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

import React from 'react';
import DocumentTypeList from './ui/DocumentTypeList';
import { getDocumentTypes } from '@/features/backoffice/contracts/actions/documentTypes.action';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DocumentTypesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : undefined;

  const documentTypes = await getDocumentTypes();
  const initialDocumentTypes = Array.isArray(documentTypes) ? documentTypes : [];

  return (
    <div className="p-4">
      <DocumentTypeList 
        initialDocumentTypes={initialDocumentTypes}
        initialSearch={search}
      />
    </div>
  );
}

