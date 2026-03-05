'use client'

import React, { useState, useEffect } from 'react'
import { TextField } from '@/shared/components/ui/TextField/TextField'
import { Button } from '@/shared/components/ui/Button/Button'
import Switch from '@/shared/components/ui/Switch/Switch'
import { useAlert } from '@/shared/hooks/useAlert'
import { useRouter } from 'next/navigation'
import {
  getPropertySEO,
  updatePropertySEO,
  type PropertySEOData,
} from '@/features/shared/propertyTypes/actions/propertySEO.action'

interface SEOSectionProps {
  propertyId: string
  propertyTitle?: string
  title?: string
  onUpdateSuccess?: () => void
}

const SEOSection: React.FC<SEOSectionProps> = ({
  propertyId,
  propertyTitle = '',
  title = 'SEO',
  onUpdateSuccess,
}) => {
  const { showAlert } = useAlert()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [formData, setFormData] = useState<PropertySEOData>({
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    isFeatured: false,
    publicationDate: undefined,
    viewsCount: 0,
    favoritesCount: 0,
  })

  // Cargar datos SEO
  useEffect(() => {
    const loadSEOData = async () => {
      try {
        setLoading(true)
        const response = await getPropertySEO(propertyId)
        if (response.success && response.data) {
          setFormData(response.data)
        } else {
          showAlert({
            message: response.error || 'Error al cargar datos SEO',
            type: 'error',
            duration: 3000,
          })
        }
      } catch (error) {
        console.error('Error loading SEO data:', error)
        showAlert({
          message: 'Error al cargar datos SEO',
          type: 'error',
          duration: 3000,
        })
      } finally {
        setLoading(false)
      }
    }

    if (propertyId) {
      loadSEOData()
    }
  }, [propertyId, showAlert])

  const handleInputChange = (field: keyof PropertySEOData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleUpdateSEO = async () => {
    try {
      setUpdating(true)
      const response = await updatePropertySEO(propertyId, formData)

      if (response.success) {
        // Refresh local form with returned data if available
        if (response.data) {
          setFormData(response.data)
        }

        // Notify parent to refresh header / other parts
        if (typeof onUpdateSuccess === 'function') {
          onUpdateSuccess()
        }

        // Refresh current route so lists/grids reflect updated values
        try {
          router.refresh()
        } catch (e) {
          // ignore if running in a context without router
        }

        showAlert({
          message: 'Datos SEO actualizados exitosamente',
          type: 'success',
          duration: 3000,
        })
      } else {
        showAlert({
          message: response.error || 'Error al actualizar datos SEO',
          type: 'error',
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Error updating SEO:', error)
      showAlert({
        message: error instanceof Error ? error.message : 'Error desconocido',
        type: 'error',
        duration: 3000,
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <section className="flex items-center justify-center py-8">
        <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
      </section>
    )
  }

  const seoTitleLength = (formData.seoTitle || '').length
  const seoDescriptionLength = (formData.seoDescription || '').length

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </p>
      </header>

      <div className="space-y-4">
        {/* SEO Title */}
        <div>
          <TextField
            label="Título SEO"
            value={formData.seoTitle || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleInputChange('seoTitle', e.target.value)}
            placeholder="Título para motores de búsqueda"
            type="text"
            className="w-full"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              Para resultados de búsqueda
            </span>
            <span className="text-xs text-muted-foreground">
              {seoTitleLength}/60
            </span>
          </div>
        </div>

        {/* SEO Description */}
        <div>
          <TextField
            label="Descripción SEO"
            value={formData.seoDescription || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleInputChange('seoDescription', e.target.value)}
            placeholder="Descripción para motores de búsqueda"
            type="text"
            rows={3}
            className="w-full"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">
              Se mostrará en resultados de búsqueda
            </span>
            <span className="text-xs text-muted-foreground">
              {seoDescriptionLength}/160
            </span>
          </div>
        </div>

        {/* SEO Keywords */}
        <div>
          <TextField
            label="Palabras clave"
            value={formData.seoKeywords || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleInputChange('seoKeywords', e.target.value)}
            placeholder="Separa palabras clave con comas: casa, venta, Santiago"
            type="text"
            rows={2}
            className="w-full"
          />
          <span className="text-xs text-muted-foreground mt-1 block">
            Palabras separadas por comas
          </span>
        </div>

        {/* Featured Toggle */}
        <div className="flex items-center justify-between p-3 border border-border rounded-lg">
          <p className="text-sm font-medium text-foreground">Destacada</p>
          <Switch
            checked={formData.isFeatured || false}
            onChange={(checked) => handleInputChange('isFeatured', checked)}
          />
        </div>

        {/* Read-only metrics */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Publicada</p>
            <p className="text-sm font-medium text-foreground">
              {formData.publicationDate
                ? new Date(formData.publicationDate).toLocaleDateString('es-CL')
                : '—'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Vistas</p>
            <p className="text-sm font-medium text-foreground">
              {formData.viewsCount || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Favoritos</p>
            <p className="text-sm font-medium text-foreground">
              {formData.favoritesCount || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          variant="outlined"
          onClick={handleUpdateSEO}
          disabled={updating}
        >
          {updating ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </section>
  )
}

export default SEOSection
