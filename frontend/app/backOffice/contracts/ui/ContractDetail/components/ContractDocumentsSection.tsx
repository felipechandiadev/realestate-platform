'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/shared/components/ui/Button/Button';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import DeleteBaseForm from '@/shared/components/ui/BaseForm/DeleteBaseForm';
import ContractDocumentCard, {
  getDocumentTypeName,
  resolveDocumentId,
} from './ContractDocumentCard';

interface ContractDocumentsSectionProps {
  documents: any[] | undefined;
  onAttachDocument?: (document: any) => void;
  onAddDocument?: () => void;
  addDocumentDisabled?: boolean;
  onDeleteDocument?: (document: any) =>
    | void
    | { success?: boolean; error?: string }
    | Promise<void | { success?: boolean; error?: string }>;
  deletingDocumentId?: string | null;
  onToggleRequired?: (document: any) => void | Promise<void>;
  togglingRequiredDocumentId?: string | null;
}


export default function ContractDocumentsSection({
  documents,
  onAttachDocument,
  onAddDocument,
  addDocumentDisabled = false,
  onDeleteDocument,
  deletingDocumentId = null,
  onToggleRequired,
  togglingRequiredDocumentId = null,
}: ContractDocumentsSectionProps) {
  const [documentPendingDeletion, setDocumentPendingDeletion] = useState<any | null>(null);
  const [isDeleteDialogSubmitting, setIsDeleteDialogSubmitting] = useState(false);
  const orderedDocuments = useMemo(() => {
    if (!Array.isArray(documents)) {
      return [];
    }

    return [...documents].sort((a: any, b: any) => {
      const score = (document: any) => {
        if (document?.uploaded) return 1;
        if (document?.required) return -1;
        return 0;
      };

      return score(a) - score(b);
    });
  }, [documents]);

  const hasDocuments = orderedDocuments.length > 0;
  const pendingDeletionId = resolveDocumentId(documentPendingDeletion);
  const isDeleteDialogOpen = Boolean(documentPendingDeletion);
  const isDeleteDialogBusy =
    isDeleteDialogSubmitting ||
    Boolean(
      pendingDeletionId &&
        deletingDocumentId &&
        pendingDeletionId === deletingDocumentId,
    );
  const deleteDialogDocumentName = documentPendingDeletion
    ? getDocumentTypeName(documentPendingDeletion)
    : 'seleccionado';

  const handleDeleteDialogOpen = (document: any) => {
    if (!onDeleteDocument || isDeleteDialogBusy) {
      return;
    }

    setDocumentPendingDeletion(document);
  };

  const handleDeleteDialogClose = () => {
    if (isDeleteDialogBusy) {
      return;
    }

    setDocumentPendingDeletion(null);
  };

  const handleDeleteConfirm = async () => {
    if (!documentPendingDeletion || typeof onDeleteDocument !== 'function') {
      setDocumentPendingDeletion(null);
      return;
    }

    let shouldCloseDialog = true;
    try {
      setIsDeleteDialogSubmitting(true);
      const result = await Promise.resolve(onDeleteDocument(documentPendingDeletion));

      if (result && typeof result === 'object' && 'success' in result && result.success === false) {
        shouldCloseDialog = false;
      }
    } catch (error) {
      shouldCloseDialog = false;
    } finally {
      setIsDeleteDialogSubmitting(false);
      if (shouldCloseDialog) {
        setDocumentPendingDeletion(null);
      }
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Documentos asociados</h3>
          <p className="text-sm text-muted-foreground">
            Registra los requisitos y controla los archivos vinculados al contrato.
          </p>
        </div>
        {onAddDocument && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAddDocument}
            disabled={addDocumentDisabled}
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Registrar documento
          </Button>
        )}
      </div>

      {!hasDocuments ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
          <span className="material-symbols-outlined text-4xl mb-2 block">description</span>
          <p>No hay documentos registrados</p>
          {onAddDocument && (
            <p className="text-xs mt-2">Usa el botón "Registrar documento" para crear un nuevo requisito.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {orderedDocuments.map((document: any, index: number) => {
            const resolvedDocumentId = resolveDocumentId(document);
            const isDeleting = Boolean(
              deletingDocumentId && resolvedDocumentId && deletingDocumentId === resolvedDocumentId,
            );
            const isCurrentDialogTarget = Boolean(
              pendingDeletionId && resolvedDocumentId && pendingDeletionId === resolvedDocumentId,
            );
            const isSameDocumentReference = Boolean(
              documentPendingDeletion && documentPendingDeletion === document,
            );
            const isIconBusy =
              isDeleting || (isDeleteDialogSubmitting && (isCurrentDialogTarget || isSameDocumentReference));
            const isToggleLoading = Boolean(
              togglingRequiredDocumentId &&
                resolvedDocumentId &&
                togglingRequiredDocumentId === resolvedDocumentId,
            );
            const isToggleDisabled =
              isIconBusy ||
              !resolvedDocumentId ||
              Boolean(
                togglingRequiredDocumentId &&
                  resolvedDocumentId &&
                  togglingRequiredDocumentId !== resolvedDocumentId,
              );

            return (
              <ContractDocumentCard
                key={resolvedDocumentId || document?.id || index}
                document={document}
                onAttachDocument={typeof onAttachDocument === 'function' ? onAttachDocument : undefined}
                onDeleteRequest={onDeleteDocument ? handleDeleteDialogOpen : undefined}
                deleteDisabled={isIconBusy}
                deleteLoading={isIconBusy}
                onToggleRequired={typeof onToggleRequired === 'function' ? onToggleRequired : undefined}
                toggleRequiredLoading={isToggleLoading}
                toggleRequiredDisabled={isToggleDisabled}
              />
            );
          })}
        </div>
      )}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        title=""
        size="xs"
      >
        <DeleteBaseForm
          message={`¿Estás seguro de que deseas eliminar el documento "${deleteDialogDocumentName}"? Esta acción no se puede deshacer.`}
          onSubmit={handleDeleteConfirm}
          isSubmitting={isDeleteDialogBusy}
          cancelButton
          cancelButtonText="Cancelar"
          onCancel={handleDeleteDialogClose}
          submitLabel="Eliminar"
          title="Eliminar documento"
        />
      </Dialog>
    </div>
  );
}
