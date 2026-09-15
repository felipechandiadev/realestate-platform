'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, FileText } from 'lucide-react';
import { useAlert } from '@/providers/AlertContext';
import { Button, Dialog, IconButton, TextField } from '@realestate/ui';
import { getDocumentTypes, type DocumentType } from '@/features/contracts/actions/documentTypes.action';
import DocumentTypeCard from '@/app/contracts/documentTypes/ui/DocumentTypeCard';
import CreateDocumentTypeForm from '@/app/contracts/documentTypes/ui/CreateDocumentTypeForm';
import UpdateDocumentTypeForm from '@/app/contracts/documentTypes/ui/UpdateDocumentTypeForm';
import DeleteBaseForm from '@/shared/components/ui/BaseForm/DeleteBaseForm';
import { deleteDocumentType } from '@/features/contracts/actions/documentTypes.action';

const CREATE_DOCUMENT_TYPE_FORM_ID = 'create-document-type-form';

interface DocumentTypesContentProps {
  initialDocumentTypes: DocumentType[];
  initialSearch?: string;
  initialError?: string | null;
}

/**
 * Document Types Content Component (CLC Pattern)
 * Implements Card Listing Content pattern for document types management
 */
export function DocumentTypesContent({
  initialDocumentTypes,
  initialSearch = '',
  initialError = null,
}: DocumentTypesContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const alert = useAlert();

  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(initialDocumentTypes);
  const [search, setSearch] = useState(initialSearch);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(!!initialError);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrors, setDeleteErrors] = useState<string[]>([]);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    if (initialError) {
      alert.error(`Error al cargar tipos de documentos: ${initialError}`);
      setHasError(true);
    }
  }, [initialError, alert]);

  const refreshDocumentTypes = async () => {
    setIsLoading(true);
    try {
      const result = await getDocumentTypes({
        search: search || undefined,
      });

      if (result.success && Array.isArray(result.data)) {
        setDocumentTypes(result.data);
      }
    } catch (error) {
      console.error('Error recargando tipos de documentos:', error);
      alert.error('Error al recargar los tipos de documentos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSearch(value);

    const params = new URLSearchParams();
    if (value.trim()) {
      params.set('search', value);
    }

    router.replace(params.toString() ? `?${params.toString()}` : '?');
  };

  const handleCreateOpen = () => {
    setSelectedDocumentType(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditOpen = (documentType: DocumentType) => {
    if (documentType.name.toLowerCase().includes('dni')) {
      alert.warning('Los documentos de identidad no se pueden editar.');
      return;
    }
    setSelectedDocumentType(documentType);
    setIsEditDialogOpen(true);
  };

  const handleDeleteOpen = (documentType: DocumentType) => {
    if (documentType.name.toLowerCase().includes('dni')) {
      alert.warning('Los documentos de identidad no se pueden eliminar.');
      return;
    }
    setSelectedDocumentType(documentType);
    setDeleteErrors([]);
    setIsDeleting(false);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSuccess = async () => {
    setIsCreateDialogOpen(false);
    await refreshDocumentTypes();
    alert.success('Tipo de documento creado correctamente');
  };

  const handleEditSuccess = async () => {
    setIsEditDialogOpen(false);
    setSelectedDocumentType(null);
    await refreshDocumentTypes();
    alert.success('Tipo de documento actualizado correctamente');
  };

  const handleDeleteSuccess = async () => {
    setIsDeleteDialogOpen(false);
    setSelectedDocumentType(null);
    await refreshDocumentTypes();
    alert.success('Tipo de documento eliminado correctamente');
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setDeleteErrors([]);
    setSelectedDocumentType(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDocumentType || isDeleting) return;

    setIsDeleting(true);
    setDeleteErrors([]);

    try {
      const result = await deleteDocumentType(selectedDocumentType.id);

      if (!result.success) {
        const errorMessage = result.error || 'Error al eliminar tipo de documento';
        alert.error(errorMessage);
        setDeleteErrors([errorMessage]);
        setIsDeleting(false);
        return;
      }

      await handleDeleteSuccess();
      // Keep isDeleting true until dialog unmounts / reopens.
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar tipo de documento';
      alert.error(message);
      setDeleteErrors([message]);
      setIsDeleting(false);
    }
  };

  const filteredDocumentTypes = useMemo(() => {
    if (!search.trim()) return documentTypes;

    const searchLower = search.toLowerCase();
    return documentTypes.filter(
      (dt) =>
        dt.name.toLowerCase().includes(searchLower) ||
        dt.description?.toLowerCase().includes(searchLower)
    );
  }, [documentTypes, search]);

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tipos de Documentos</h1>
          <p className="text-muted-foreground mt-1">Gestión de tipos de documentos para contratos</p>
        </div>
        <IconButton
          icon="add"
          variant="text"
          onClick={handleCreateOpen}
          ariaLabel="Crear tipo de documento"
          size="lg"
        />
      </div>

      {/* Search */}
      <div className="flex-1 min-w-0 max-w-xs sm:max-w-sm">
        <TextField
          label="Buscar tipos de documentos"
          placeholder="Por nombre o descripción..."
          value={search}
          onChange={handleSearchChange}
          startIcon="search"
          type="search"
        />
      </div>

      {/* Content States */}
      {hasError && !isLoading && (
        <div className="text-center py-16 text-red-500">
          <AlertCircle className="mx-auto mb-4 h-16 w-16" aria-hidden />
          <p className="text-lg font-medium">Error al cargar tipos de documentos</p>
          <p className="text-sm text-muted-foreground mt-2">Por favor, intenta recargar la página</p>
        </div>
      )}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-lg border border-border h-48 animate-pulse" />
          ))}
        </div>
      ) : filteredDocumentTypes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="mx-auto mb-4 h-16 w-16" aria-hidden />
          <p className="text-lg font-medium">No hay tipos de documentos disponibles</p>
          <p className="text-sm">Crea tu primer tipo de documento para empezar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filteredDocumentTypes.map((documentType) => (
            <DocumentTypeCard
              key={documentType.id}
              documentType={documentType}
              onEdit={handleEditOpen}
              onDelete={handleDeleteOpen}
              onUpdate={refreshDocumentTypes}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        title="Crear Tipo de Documento"
        size="sm"
        actions={
          <>
            <Button
              variant="outlinedSecondary"
              type="button"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              form={CREATE_DOCUMENT_TYPE_FORM_ID}
            >
              Crear
            </Button>
          </>
        }
      >
        <CreateDocumentTypeForm
          nested
          formId={CREATE_DOCUMENT_TYPE_FORM_ID}
          onSuccess={handleCreateSuccess}
        />
      </Dialog>

      {isEditDialogOpen && selectedDocumentType && (
        <Dialog
          open={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          title="Editar Tipo de Documento"
          size="lg"
        >
          <UpdateDocumentTypeForm
            documentType={selectedDocumentType}
            onCancel={() => setIsEditDialogOpen(false)}
            onSuccess={handleEditSuccess}
          />
        </Dialog>
      )}

      {isDeleteDialogOpen && selectedDocumentType && (
        <Dialog
          open={isDeleteDialogOpen}
          onClose={handleDeleteCancel}
          title=""
          size="sm"
        >
          <DeleteBaseForm
            title="Eliminar tipo de documento"
            message={`¿Está seguro que desea eliminar el tipo de documento "${selectedDocumentType.name}"?`}
            subtitle="Esta acción no se puede deshacer."
            onSubmit={handleDeleteConfirm}
            isSubmitting={isDeleting}
            submitLabel="Eliminar"
            cancelButton
            cancelButtonText="Cancelar"
            onCancel={handleDeleteCancel}
            errors={deleteErrors}
          />
        </Dialog>
      )}
    </div>
  );
}
