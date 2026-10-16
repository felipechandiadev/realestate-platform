'use client'

import React, { useState, useEffect } from 'react'
import {
  TextField,
  Button,
  OtherFeaturesChips,
  OtherFeaturesPickerDialog,
  normalizeOtherFeatures,
  type OtherFeatureKey,
} from '@realestate/ui'
import { getPropertyCharacteristics, updatePropertyCharacteristics } from '@/features/properties/actions/properties.action'
import { useAlert } from '@/shared/hooks/useAlert'
import { LucideIcon } from './LucideIcon'

interface CharacteristicsSectionProps {
  propertyId: string
  title?: string
}

interface Characteristic {
  name: string
  value: number
  enabled: boolean
}

const CharacteristicsSection: React.FC<CharacteristicsSectionProps> = ({
  propertyId,
  title = 'Características',
}) => {
  const { showAlert } = useAlert()
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([])
  const [propertyType, setPropertyType] = useState<string>('')
  const [otherFeatures, setOtherFeatures] = useState<OtherFeatureKey[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const loadCharacteristics = async () => {
      try {
        setLoading(true)
        const response = await getPropertyCharacteristics(propertyId)
        if (response.success && response.data) {
          const payload = response.data
          const chars: Characteristic[] = Array.isArray(payload?.characteristics)
            ? payload.characteristics
            : Array.isArray(payload)
              ? payload
              : []
          setCharacteristics(chars)
          setPropertyType(payload?.propertyType || '')
          setOtherFeatures(normalizeOtherFeatures(payload?.otherFeatures))

          const initialData: { [key: string]: string } = {}
          chars.forEach((char: Characteristic) => {
            initialData[char.name] = char.value?.toString() || ''
          })
          setFormData(initialData)
        } else {
          setError(response.error || 'No se pudieron cargar las características')
        }
      } catch (err) {
        console.error('Error loading characteristics:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (propertyId) {
      loadCharacteristics()
    }
  }, [propertyId])

  const handleUpdateCharacteristics = async () => {
    try {
      setUpdating(true)

      const characteristicsMap: { [key: string]: string } = {
        'Metros cuadrados construidos': 'builtSquareMeters',
        'Metros cuadrados de terreno': 'landSquareMeters',
        'Dormitorios': 'bedrooms',
        'Baños': 'bathrooms',
        'Espacios de estacionamiento': 'parkingSpaces',
        'Pisos': 'floors',
        'Año de construcción': 'constructionYear',
      }

      const characteristicsData: { [key: string]: number | string[] } = {
        otherFeatures,
      }

      characteristics.forEach((char) => {
        const dtoKey = characteristicsMap[char.name]
        if (!dtoKey) return

        const raw = (formData[char.name] ?? '').trim()
        if (dtoKey === 'constructionYear') {
          // Optional: omit empty / 0 so backend does not reject Min(1800)
          if (!raw) return
          const year = Number(raw)
          if (!Number.isFinite(year) || year === 0) return
          characteristicsData[dtoKey] = year
          return
        }

        characteristicsData[dtoKey] = parseFloat(raw || '0')
      })

      const response = await updatePropertyCharacteristics(propertyId, characteristicsData)

      if (response.success) {
        showAlert({
          message: 'Características actualizadas exitosamente',
          type: 'success',
          duration: 3000,
        })
      } else {
        showAlert({
          message: response.error || 'Error al actualizar características',
          type: 'error',
          duration: 3000,
        })
      }
    } catch (err) {
      console.error('Error updating characteristics:', err)
      showAlert({
        message: err instanceof Error ? err.message : 'Error desconocido',
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
        <div className="flex justify-center">
          <LucideIcon name="progress_activity" size={20} spin />
        </div>
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
    <section className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
        {propertyType && (
          <p className="text-sm text-muted-foreground">Tipo de propiedad: <span className="font-medium text-foreground">{propertyType}</span></p>
        )}
      </header>

      {characteristics.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay características numéricas disponibles para este tipo de propiedad.</p>
      ) : (
        <div className="space-y-4">
          {characteristics.map((char: Characteristic) => (
            <TextField
              key={char.name}
              label={char.name}
              value={formData[char.name] || ''}
              onChange={(e) => setFormData({ ...formData, [char.name]: e.target.value })}
              type="number"
              placeholder={`Ingrese ${char.name}`}
              className="w-full"
              readOnly={!char.enabled}
            />
          ))}
        </div>
      )}

      <div className="flex w-full flex-col gap-3 rounded-lg border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">Otras características</p>
            <p className="text-xs text-muted-foreground">
              Amenities opcionales (piscina, parrilla, amoblado, etc.).
            </p>
          </div>
          <Button type="button" variant="outlined" onClick={() => setPickerOpen(true)}>
            Seleccionar
          </Button>
        </div>
        <OtherFeaturesChips value={otherFeatures} />
      </div>

      <OtherFeaturesPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        value={otherFeatures}
        onApply={(keys) => setOtherFeatures(keys)}
      />

      <div className="flex justify-end mt-6">
        <Button
          variant="outlined"
          onClick={handleUpdateCharacteristics}
          disabled={updating}
        >
          Actualizar
        </Button>
      </div>
    </section>
  )
}

export default CharacteristicsSection
