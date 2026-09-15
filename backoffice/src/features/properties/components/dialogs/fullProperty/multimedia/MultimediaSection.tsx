'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Button, LoadingState } from '@realestate/ui';
import { MultimediaUploader } from '@/shared/components/ui/FileUploader/MultimediaUploader';
import MultimediaPropertyCard from './MultimediaPropertyCard';
import {
  getPropertyMultimedia,
  deletePropertyMultimedia,
  updateMainMultimediaUrl,
  uploadPropertyMultimedia,
} from '@/features/properties/actions/properties.action';
import { useAlert } from '@/shared/hooks/useAlert';

interface MultimediaSectionProps {
  propertyId: string;
  title?: string;
}

interface MultimediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  size?: number;
  uploadedAt?: string;
  mainImageUrl?: string | null;
}

const MultimediaSection: React.FC<MultimediaSectionProps> = ({
  propertyId,
  title = 'Multimedia',
}) => {
  const { showAlert } = useAlert();
  const [multimedias, setMultimedias] = useState<MultimediaItem[]>([]);
  const [mainImageUrl, setMainImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingMainId, setUpdatingMainId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const loadMultimedia = useCallback(async () => {
    if (!propertyId) {
      setLoading(false);
      setError('ID de propiedad no válido');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await getPropertyMultimedia(propertyId);
      if (response.success) {
        const items = Array.isArray(response.data) ? (response.data as MultimediaItem[]) : [];
        setMultimedias(items);
        const main =
          items.find((item) => item.mainImageUrl)?.mainImageUrl ||
          items[0]?.mainImageUrl ||
          items[0]?.url ||
          '';
        setMainImageUrl(main || '');
      } else {
        setMultimedias([]);
        setError(response.error || 'No se pudo cargar la multimedia');
      }
    } catch (err) {
      console.error('Error loading multimedia:', err);
      setMultimedias([]);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    void loadMultimedia();
  }, [loadMultimedia]);

  const handleDelete = async (multimediaId: string) => {
    try {
      setDeletingId(multimediaId);
      const response = await deletePropertyMultimedia(propertyId, multimediaId);

      if (response.success) {
        showAlert({
          message: 'Multimedia eliminada exitosamente',
          type: 'success',
          duration: 3000,
        });
        await loadMultimedia();
      } else {
        showAlert({
          message: response.error || 'Error al eliminar multimedia',
          type: 'error',
          duration: 3000,
        });
      }
    } catch (err) {
      console.error('Error deleting multimedia:', err);
      showAlert({
        message: err instanceof Error ? err.message : 'Error desconocido',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetAsMain = async (url: string) => {
    try {
      setUpdatingMainId(url);
      const response = await updateMainMultimediaUrl(propertyId, url);

      if (response.success) {
        setMainImageUrl(url);
        showAlert({
          message: 'Multimedia principal actualizada',
          type: 'success',
          duration: 3000,
        });
        await loadMultimedia();
      } else {
        showAlert({
          message: response.error || 'Error al actualizar multimedia principal',
          type: 'error',
          duration: 3000,
        });
      }
    } catch (err) {
      console.error('Error updating main multimedia:', err);
      showAlert({
        message: err instanceof Error ? err.message : 'Error desconocido',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setUpdatingMainId(null);
    }
  };

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      const response = await uploadPropertyMultimedia(propertyId, selectedFiles);

      if (response.success) {
        showAlert({
          message: `${selectedFiles.length} archivo(s) subido(s) exitosamente`,
          type: 'success',
          duration: 3000,
        });
        setSelectedFiles([]);
        await loadMultimedia();
      } else {
        showAlert({
          message: response.error || 'Error al subir archivos',
          type: 'error',
          duration: 3000,
        });
      }
    } catch (err) {
      console.error('Error uploading multimedia:', err);
      showAlert({
        message: err instanceof Error ? err.message : 'Error desconocido',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <section className="flex items-center justify-center py-8">
        <LoadingState label="Cargando multimedia" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4">
        <header className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {title}
          </p>
          <p className="text-sm text-red-500">Error: {error}</p>
        </header>
        <Button type="button" variant="outlined" size="md" onClick={() => void loadMultimedia()}>
          Reintentar
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </p>
        {multimedias.length > 0 ? (
          <p className="text-sm text-muted-foreground">{multimedias.length} archivo(s)</p>
        ) : (
          <p className="text-sm text-muted-foreground">Aún no hay archivos. Sube imágenes o videos.</p>
        )}
      </header>

      {multimedias.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {multimedias.map((multimedia) => (
            <MultimediaPropertyCard
              key={multimedia.id}
              url={multimedia.url}
              type={multimedia.type}
              mainImageUrl={mainImageUrl}
              multimediaId={multimedia.id}
              onDelete={handleDelete}
              onSetAsMain={handleSetAsMain}
              isDeleting={deletingId === multimedia.id}
              isUpdatingMain={updatingMainId === multimedia.url}
            />
          ))}
        </div>
      ) : null}

      <div className="space-y-4 border-t pt-6">
        <MultimediaUploader
          uploadPath={`/properties/${propertyId}/multimedia`}
          onChange={handleFileSelect}
          accept="image/*,video/*"
          maxSize={70}
          maxFiles={20}
          label=""
          aspectRatio="16:9"
        />

        {selectedFiles.length > 0 ? (
          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                {selectedFiles.length} archivo(s) seleccionado(s)
              </p>
              <p className="mt-1 text-xs text-blue-700">
                Haz clic en &quot;Subir archivos&quot; para cargarlos
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleUpload()}
              disabled={uploading}
              className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
            >
              {uploading ? 'Subiendo...' : 'Subir archivos'}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default MultimediaSection;
