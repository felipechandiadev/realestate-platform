'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DocumentType } from '@/features/backoffice/contracts/actions/documentTypes.action';
import { deleteDocumentType, toggleDocumentTypeAvailability } from '@/features/backoffice/contracts/actions/documentTypes.action';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import Switch from '@/shared/components/ui/Switch/Switch';
import { useAlert } from '@/providers/AlertContext';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import UpdateDocumentTypeForm from '@/app/backOffice/contracts/documentTypes/ui/UpdateDocumentTypeForm';
import DeleteBaseForm from '@/shared/components/ui/BaseForm/DeleteBaseForm';

interface DocumentTypeCardProps {
  documentType: DocumentType;
  onUpdate?: () => void;
}

export default function DocumentTypeCard({ documentType, onUpdate }: DocumentTypeCardProps) {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [isRemoving, setIsRemoving] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrors, setDeleteErrors] = useState<string[]>([]);
  const isDniType = documentType.name.toLowerCase().includes('dni');

  const handleToggleAvailability = async (checked: boolean) => {
    setIsTogglingAvailability(true);
    try {
      const result = await toggleDocumentTypeAvailability(documentType.id, checked);
      
      if (!result.success) {
        showAlert({
          message: result.error || 'Error al cambiar disponibilidad',
          type: 'error',
          duration: 5000,
        });
        return;
      }

      showAlert({
        message: `Tipo de documento ${checked ? 'activado' : 'desactivado'} exitosamente`,
        type: 'success',
        duration: 3000,
      });
      
      router.refresh();
      onUpdate?.();
    } catch (error) {
      showAlert({
        message: 'Error al cambiar disponibilidad',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  const handleDeleteClick = () => {
    if (isDniType) {
      showAlert({
        message: 'Los documentos de identidad no se pueden eliminar.',
        type: 'warning',
        duration: 4000,
      });
      return;
    }

    setDeleteErrors([]);
    setShowDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setDeleteErrors([]);
    setIsDeleting(false);
    setIsRemoving(false);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setDeleteErrors([]);
    setIsRemoving(true);

    try {
      const result = await deleteDocumentType(documentType.id);

      if (!result.success) {
        const errorMessage = result.error || 'Error al eliminar tipo de documento';
        showAlert({
          message: errorMessage,
          type: 'error',
          duration: 5000,
        });
        setDeleteErrors([errorMessage]);
        setIsRemoving(false);
        return;
      }

      showAlert({
        message: 'Tipo de documento eliminado exitosamente',
        type: 'success',
        duration: 3000,
      });

      setShowDeleteDialog(false);
      setTimeout(() => {
        router.refresh();
        onUpdate?.();
      }, 300);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar tipo de documento';
      showAlert({
        message,
        type: 'error',
        duration: 5000,
      });
      setDeleteErrors([message]);
      setIsRemoving(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        className={`bg-card rounded-lg p-6 border border-border shadow-sm hover:shadow-md transition-all flex flex-col h-full ${
          isRemoving ? 'opacity-50' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <span className="material-symbols-outlined text-4xl text-primary">description</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{documentType.name}</h3>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  documentType.available
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {documentType.available ? 'Disponible' : 'No disponible'}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="flex-1 mb-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {documentType.description || 'Sin descripción'}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-2 mt-4 pt-4 border-t border-border">
          {/* Left: Availability Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              checked={documentType.available}
              onChange={handleToggleAvailability}
              label="Disponible"
              labelPosition="right"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex gap-2">
            <IconButton
              icon="edit"
              variant="text"
              onClick={() => {
                if (isDniType) {
                  showAlert({
                    message: 'Los documentos de identidad no se pueden editar.',
                    type: 'warning',
                    duration: 4000,
                  });
                  return;
                }
                setShowUpdateDialog(true);
              }}
              disabled={isRemoving || isDniType}
              title={isDniType ? 'Edición deshabilitada para DNI' : 'Editar'}
            />
            <IconButton
              icon="delete"
              variant="text"
              onClick={handleDeleteClick}
              disabled={isRemoving || isDniType}
              className="text-red-500 hover:text-red-600"
              title={isDniType ? 'Eliminación deshabilitada para DNI' : 'Eliminar'}
            />
          </div>
        </div>
      </div>

      {/* Update Dialog */}
      {showUpdateDialog && !isDniType && (
        <Dialog
          open={showUpdateDialog}
          onClose={() => setShowUpdateDialog(false)}
          title="Editar Tipo de Documento"
          size="md"
        >
          <UpdateDocumentTypeForm
            documentType={documentType}
            onCancel={() => setShowUpdateDialog(false)}
            onSuccess={() => {
              setShowUpdateDialog(false);
              router.refresh();
              onUpdate?.();
            }}
          />
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && !isDniType && (
        <Dialog
          open={showDeleteDialog}
          onClose={handleDeleteCancel}
          title=""
          size="sm"
        >
          <DeleteBaseForm
            title="Eliminar tipo de documento"
            message={`¿Está seguro que desea eliminar el tipo de documento "${documentType.name}"?`}
            subtitle="Esta acción no se puede deshacer."
            onSubmit={() => { void handleDeleteConfirm(); }}
            isSubmitting={isDeleting}
            submitLabel="Eliminar"
            cancelButton
            cancelButtonText="Cancelar"
            onCancel={handleDeleteCancel}
            errors={deleteErrors}
          />
        </Dialog>
      )}
    </>
  );
}
