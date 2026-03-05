'use client'

import React, { useState, useEffect } from 'react'
import { MultimediaUploader } from '@/shared/components/ui/FileUploader/MultimediaUploader'
import MultimediaPropertyCard from './MultimediaPropertyCard'
import {
  getPropertyMultimedia,
  deletePropertyMultimedia,
  updateMainMultimediaUrl,
  uploadPropertyMultimedia,
} from '@/features/backoffice/properties/actions/properties.action'
import { useAlert } from '@/shared/hooks/useAlert'

interface MultimediaSectionProps {
  propertyId: string
  title?: string
}

interface Multimedia {
  id: string
  url: string
  type: 'image' | 'video'
  size?: number
  uploadedAt?: string
}

const MultimediaSection: React.FC<MultimediaSectionProps> = ({
  propertyId,
  title = 'Multimedia',
}) => {
  const { showAlert } = useAlert()
  const [multimedias, setMultimedias] = useState<Multimedia[]>([])
  const [mainImageUrl, setMainImageUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [updatingMainId, setUpdatingMainId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  // Load multimedia
  useEffect(() => {
    loadMultimedia()
  }, [propertyId])

  const loadMultimedia = async () => {
    try {
      setLoading(true)
      const response = await getPropertyMultimedia(propertyId)
      if (response.success && response.data) {
        setMultimedias(response.data)
        
        // Extract main image URL from first item or from response
        if (response.data.length > 0 && response.data[0].mainImageUrl) {
          setMainImageUrl(response.data[0].mainImageUrl)
        }
      } else {
        setError(response.error || 'Failed to load multimedia')
      }
    } catch (err) {
      console.error('Error loading multimedia:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (multimediaId: string) => {
    try {
      setDeletingId(multimediaId)
      const response = await deletePropertyMultimedia(propertyId, multimediaId)

      if (response.success) {
        showAlert({
          message: 'Multimedia eliminada exitosamente',
          type: 'success',
          duration: 3000,
        })
        // Reload multimedia list
        await loadMultimedia()
      } else {
        showAlert({
          message: response.error || 'Error al eliminar multimedia',
          type: 'error',
          duration: 3000,
        })
      }
    } catch (err) {
      console.error('Error deleting multimedia:', err)
      showAlert({
        message: err instanceof Error ? err.message : 'Error desconocido',
        type: 'error',
        duration: 3000,
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleSetAsMain = async (url: string) => {
    try {
      setUpdatingMainId(url)
      const response = await updateMainMultimediaUrl(propertyId, url)

      if (response.success) {
        setMainImageUrl(url)
        showAlert({
          message: 'Multimedia principal actualizada',
          type: 'success',
          duration: 3000,
        })
        // Reload to sync with backend
        await loadMultimedia()
      } else {
        showAlert({
          message: response.error || 'Error al actualizar multimedia principal',
          type: 'error',
          duration: 3000,
        })
      }
    } catch (err) {
      console.error('Error updating main multimedia:', err)
      showAlert({
        message: err instanceof Error ? err.message : 'Error desconocido',
        type: 'error',
        duration: 3000,
      })
    } finally {
      setUpdatingMainId(null)
    }
  }

  const handleFileSelect = (files: File[]) => {
    // Solo guardar los archivos seleccionados, no ejecutar upload
    setSelectedFiles(files)
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    try {
      setUploading(true)

      const response = await uploadPropertyMultimedia(propertyId, selectedFiles)

      if (response.success) {
        showAlert({
          message: `${selectedFiles.length} archivo(s) subido(s) exitosamente`,
          type: 'success',
          duration: 3000,
        })
        // Limpiar archivos seleccionados
        setSelectedFiles([])
        // Reload multimedia list
        await loadMultimedia()
      } else {
        showAlert({
          message: response.error || 'Error al subir archivos',
          type: 'error',
          duration: 3000,
        })
      }
    } catch (err) {
      console.error('Error uploading multimedia:', err)
      showAlert({
        message: err instanceof Error ? err.message : 'Error desconocido',
        type: 'error',
        duration: 3000,
      })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <section className="flex items-center justify-center py-8">
        <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="space-y-4">
        <header className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
          <p className="text-sm text-red-500">Error: {error}</p>
        </header>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
        {multimedias.length > 0 && (
          <p className="text-sm text-muted-foreground">{multimedias.length} archivo(s)</p>
        )}
      </header>

      {/* Multimedias Gallery */}
      {multimedias.length > 0 && (
        <div className="space-y-4">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
        </div>
      )}

      {/* Upload Section */}
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

        {/* Upload Button - Only show if files are selected */}
        {selectedFiles.length > 0 && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                {selectedFiles.length} archivo(s) seleccionado(s)
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Haz clic en "Subir archivos" para cargarlos
              </p>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              {uploading ? 'Subiendo...' : 'Subir archivos'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default MultimediaSection
