'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import FileUploader from '@/shared/components/ui/FileUploader/FileUploader';
import type { DocumentType } from '@/features/backoffice/contracts/actions/documentTypes.action';

interface ContractDocumentForUpload {
  id?: string;
  documentId?: string;
  title?: string;
  notes?: string;
  documentTypeId?: string;
  documentTypeName?: string;
  documentType?: {
    id?: string;
    name?: string;
  };
  personName?: string;
  personId?: string;
  status?: string;
  uploaded?: boolean;
}

interface ContractUploadContractDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  document: ContractDocumentForUpload | null;
  documentTypes: DocumentType[];
  loadingDocumentTypes: boolean;
  submitting: boolean;
  onSubmit: (payload: {
    documentTypeId: string;
    title: string;
    notes?: string;
    file: File;
    documentId?: string;
  }) => Promise<void>;
}

const resolveDocumentTypeLabel = (
  document: ContractDocumentForUpload | null,
  documentTypes: DocumentType[],
): string => {
  if (!document) {
    return '';
  }

  if (typeof document.documentTypeName === 'string' && document.documentTypeName.trim().length > 0) {
    return document.documentTypeName.trim();
  }

  if (typeof document.documentType?.name === 'string' && document.documentType.name.trim().length > 0) {
    return document.documentType.name.trim();
  }

  if (typeof document.documentTypeId === 'string') {
    const matchingType = documentTypes.find((type) => type.id === document.documentTypeId);
    if (matchingType) {
      return matchingType.name;
    }
  }

  return 'Documento asociado';
};

const resolveDocumentStatus = (document: ContractDocumentForUpload | null): string => {
  if (!document) {
    return 'PENDING';
  }

  if (typeof document.status === 'string' && document.status.trim().length > 0) {
    return document.status.trim();
  }

  return document.uploaded ? 'UPLOADED' : 'PENDING';
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  UPLOADED: 'Subido',
  RECIBIDO: 'Recibido',
  REJECTED: 'Rechazado',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border border-amber-200',
  UPLOADED: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  RECIBIDO: 'bg-blue-100 text-blue-800 border border-blue-200',
  REJECTED: 'bg-rose-100 text-rose-700 border border-rose-200',
};

export default function ContractUploadContractDocumentDialog({
  open,
  onClose,
  document,
  documentTypes,
  loadingDocumentTypes,
  submitting,
  onSubmit,
}: ContractUploadContractDocumentDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (open) {
      setFile(null);
      setFormError('');
    }
  }, [open, document?.id]);

  const documentTypeId = document?.documentTypeId || document?.documentType?.id || null;

  const documentTypeLabel = useMemo(
    () => resolveDocumentTypeLabel(document, documentTypes),
    [document, documentTypes],
  );

  const resolvedTitle = useMemo(() => {
    const fromDocument = (document?.title || '').trim();
    if (fromDocument) {
      return fromDocument;
    }
    return documentTypeLabel.trim();
  }, [document?.title, documentTypeLabel]);

  const resolvedNotes = useMemo(() => (document?.notes || '').trim(), [document?.notes]);
  const resolvedDocumentId = useMemo(() => {
    const docId = typeof document?.documentId === 'string' && document.documentId.trim().length > 0
      ? document.documentId.trim()
      : undefined;
    if (docId) {
      return docId;
    }
    return typeof document?.id === 'string' && document.id.trim().length > 0
      ? document.id.trim()
      : undefined;
  }, [document?.documentId, document?.id]);

  const statusKey = resolveDocumentStatus(document);
  const statusLabel = statusLabels[statusKey] || statusKey;
  const statusTone = statusColors[statusKey] || 'bg-gray-100 text-gray-800 border border-gray-200';

  const canSubmit = Boolean(
    documentTypeId && resolvedTitle.trim() && file && !submitting && !loadingDocumentTypes,
  );

  const handleSubmit = async () => {
    if (!documentTypeId) {
      setFormError('El documento no tiene un tipo asociado.');
      return;
    }

    if (!resolvedTitle.trim() || !file) {
      setFormError('Selecciona un archivo para continuar.');
      return;
    }

    setFormError('');
    await onSubmit({
      documentTypeId,
      title: resolvedTitle.trim(),
      notes: resolvedNotes || undefined,
      file,
      documentId: resolvedDocumentId,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Adjuntar documento al contrato"
      size="md"
      hideActions
      scroll="body"
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">{documentTypeLabel}</h4>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusTone}`}>
              {statusLabel}
            </span>
          </div>
          {document?.personName && (
            <p className="text-xs text-muted-foreground">
              Asociado a: <span className="font-medium text-foreground">{document.personName}</span>
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Sube el archivo correspondiente para completar el registro.
          </p>
        </div>

        {resolvedNotes && (
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Información registrada
            </p>
            <p className="text-sm text-foreground whitespace-pre-line">{resolvedNotes}</p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-foreground mb-2">Archivo</p>
          <FileUploader
            onFileSelect={setFile}
            accept="application/pdf,image/*"
            disabled={submitting}
          />
        </div>

        {formError && <p className="text-sm text-red-500">{formError}</p>}

        {!loadingDocumentTypes && !documentTypeId && (
          <p className="text-sm text-red-500">
            Este documento no tiene un tipo configurado. Edita el requisito antes de adjuntar archivos.
          </p>
        )}

        {loadingDocumentTypes && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
            <span>Cargando tipos de documento...</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="text" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
                Subiendo...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">upload_file</span>
                Adjuntar
              </span>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
