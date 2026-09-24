'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DocumentType } from '@/features/backoffice/contracts/actions/documentTypes.action';
import { toggleDocumentTypeAvailability } from '@/features/backoffice/contracts/actions/documentTypes.action';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import Switch from '@/shared/components/ui/Switch/Switch';
import { useAlert } from '@/providers/AlertContext';

interface DocumentTypeCardProps {
  documentType: DocumentType;
  onEdit: (documentType: DocumentType) => void;
  onDelete: (documentType: DocumentType) => void;
  onUpdate?: () => void;
}

export default function DocumentTypeCard({
  documentType,
  onEdit,
  onDelete,
  onUpdate,
}: DocumentTypeCardProps) {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
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

  return (
    <div
      className={`bg-card rounded-lg p-6 border border-border shadow-sm hover:shadow-md transition-all flex flex-col h-full`}
    >
      {/* Header with Icon and Title */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="material-symbols-outlined text-4xl text-primary">description</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground break-words">{documentType.name}</h3>
            {/* Status Badge */}
            <span
              className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                documentType.available
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'border border-border text-muted-foreground bg-transparent'
              }`}
            >
              {documentType.available ? 'Habilitado' : 'Deshabilitado'}
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

      {/* Footer: Availability Toggle and Actions */}
      <div className="flex justify-between items-center gap-2">
        {/* Left: Availability Toggle */}
        <div className="flex items-center gap-2">
          <Switch
            checked={documentType.available}
            onChange={handleToggleAvailability}
            disabled={isTogglingAvailability || isDniType}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex gap-2">
          <IconButton
            icon="edit"
            variant="text"
            onClick={() => onEdit(documentType)}
            disabled={isDniType}
            title={isDniType ? 'Edición deshabilitada para DNI' : 'Editar'}
          />
          <IconButton
            icon="delete"
            variant="text"
            onClick={() => onDelete(documentType)}
            disabled={isDniType}
            className="text-red-500 hover:text-red-600"
            title={isDniType ? 'Eliminación deshabilitada para DNI' : 'Eliminar'}
          />
        </div>
      </div>
    </div>
  );
}
