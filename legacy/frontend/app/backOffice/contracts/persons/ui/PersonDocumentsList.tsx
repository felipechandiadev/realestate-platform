'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAlert } from '@/providers/AlertContext';
import DotProgress from '@/shared/components/ui/DotProgress/DotProgress';
import { 
  getPersonDocuments, 
  deleteDocument,
  type DocumentEntity 
} from '@/features/backoffice/contracts/actions/documents.action';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import Badge from '@/shared/components/ui/Badge/Badge';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';

type PersonDocumentsListProps = {
  personId: string;
  compact?: boolean;
};

export default function PersonDocumentsList({ personId, compact = false }: PersonDocumentsListProps) {
  const alert = useAlert();
  const [documents, setDocuments] = useState<DocumentEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentEntity | null>(null);
  const [expandedTooltip, setExpandedTooltip] = useState(false);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPersonDocuments(personId);
      if (result.success && result.data) {
        setDocuments(result.data);
      } else {
        console.error('Error loading documents:', result.error);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const handleDeleteClick = (doc: DocumentEntity) => {
    setDocumentToDelete(doc);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    setDeleting(documentToDelete.id);
    setShowDeleteDialog(false);

    try {
      const result = await deleteDocument(documentToDelete.id);
      if (result.success) {
        alert.showAlert({
          message: `Documento "${documentToDelete.title}" eliminado`,
          type: 'success',
          duration: 3000,
        });
        await loadDocuments();
      } else {
        alert.showAlert({
          message: result.error || 'Error al eliminar documento',
          type: 'error',
          duration: 5000,
        });
      }
    } catch {
      alert.showAlert({
        message: 'Error al eliminar documento',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setDeleting(null);
      setDocumentToDelete(null);
    }
  };

  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { variant: 'warning' as const, label: 'Pendiente' };
      case 'UPLOADED':
        return { variant: 'info' as const, label: 'Subido' };
      case 'RECIBIDO':
        return { variant: 'success' as const, label: 'Recibido' };
      case 'REJECTED':
        return { variant: 'error' as const, label: 'Rechazado' };
      default:
        return { variant: 'primary' as const, label: status };
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return compact ? (
      <div className="flex items-center justify-center">
        <DotProgress />
      </div>
    ) : (
      <div className="flex items-center justify-center py-4">
        <DotProgress />
      </div>
    );
  }

  // Compact version for DataGrid
  if (compact) {
    return (
      <div
        className="relative inline-flex"
        onMouseEnter={() => setExpandedTooltip(true)}
        onMouseLeave={() => setExpandedTooltip(false)}
      >
        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-border bg-white text-[11px] font-semibold text-foreground cursor-pointer shadow-sm">
          <span className="material-symbols-outlined text-[12px] leading-none">
            description
          </span>
          <span className="leading-none">{documents.length}</span>
        </div>

        {/* Tooltip on hover */}
        {expandedTooltip && (
          <div className="absolute z-50 left-0 top-full mt-2 bg-white dark:bg-slate-900 text-foreground border border-border rounded-lg shadow-lg p-3 min-w-[280px]">
            <p className="text-xs font-semibold text-foreground mb-2">Documentos de la persona:</p>
            {documents.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin documentos registrados.</p>
            ) : (
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {documents.map((doc) => {
                  const badgeProps = getStatusBadgeProps(doc.status);
                  return (
                    <div key={doc.id} className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {doc.multimedia ? (
                          <span className="material-symbols-outlined text-blue-500 text-sm">attach_file</span>
                        ) : (
                          <span className="material-symbols-outlined text-muted-foreground text-sm">description</span>
                        )}
                        <span className="truncate text-foreground">{doc.title}</span>
                      </div>
                      <Badge variant={badgeProps.variant} className="text-xs shrink-0">
                        {badgeProps.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full version
  return (
    <>
      <div className="space-y-3">
        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <span className="material-symbols-outlined text-4xl mb-2">description</span>
            <p>No hay documentos registrados</p>
          </div>
        ) : (
          documents.map((doc) => {
            const badgeProps = getStatusBadgeProps(doc.status);
            return (
              <div
                key={doc.id}
                className={`border border-border rounded-lg p-4 ${
                  deleting === doc.id ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {doc.multimedia ? (
                      <span className="material-symbols-outlined text-blue-500 text-2xl">attach_file</span>
                    ) : (
                      <span className="material-symbols-outlined text-muted-foreground text-2xl">description</span>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">{doc.title}</h4>
                      
                      {doc.documentType && (
                        <p className="text-sm text-muted-foreground">{doc.documentType.name}</p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={badgeProps.variant}>
                          {badgeProps.label}
                        </Badge>
                        
                        {doc.multimedia && (
                          <span className="text-xs text-muted-foreground">
                            {doc.multimedia.filename}
                          </span>
                        )}
                      </div>
                      
                      {doc.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          {doc.notes}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        Creado: {new Date(doc.createdAt).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {doc.multimedia && (
                      <>
                        <IconButton
                          icon="visibility"
                          variant="text"
                          size="sm"
                          onClick={() => window.open(doc.multimedia!.url, '_blank')}
                          title="Ver documento"
                        />
                        <IconButton
                          icon="download"
                          variant="text"
                          size="sm"
                          onClick={() => downloadFile(doc.multimedia!.url, doc.multimedia!.filename)}
                          title="Descargar"
                        />
                      </>
                    )}
                    <IconButton
                      icon="delete"
                      variant="text"
                      size="sm"
                      onClick={() => handleDeleteClick(doc)}
                      disabled={deleting === doc.id}
                      className="text-red-500 hover:text-red-600"
                      title="Eliminar"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && documentToDelete && (
        <Dialog
          open={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setDocumentToDelete(null);
          }}
          title="Confirmar eliminación"
          size="sm"
          actions={
            <div className="flex gap-2 justify-end">
              <Button
                variant="outlined"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDocumentToDelete(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteConfirm}
                className="bg-red-500 hover:bg-red-600"
              >
                Eliminar
              </Button>
            </div>
          }
        >
          <p className="text-foreground">
            ¿Está seguro que desea eliminar el documento{' '}
            <strong>{documentToDelete.title}</strong>?
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Esta acción no se puede deshacer.
          </p>
        </Dialog>
      )}
    </>
  );
}
