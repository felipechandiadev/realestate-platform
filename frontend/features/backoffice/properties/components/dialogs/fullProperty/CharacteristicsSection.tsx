'use client'

import React, { useState, useEffect } from 'react'
import { TextField } from '@/shared/components/ui/TextField/TextField'
import Alert from '@/shared/components/ui/Alert/Alert'
import { Button } from '@/shared/components/ui/Button/Button'
import { getPropertyCharacteristics, updatePropertyCharacteristics } from '@/features/backoffice/properties/actions/properties.action'
import { useAlert } from '@/shared/hooks/useAlert'

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
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<{ [key: string]: string }>({})

  // Load characteristics
  useEffect(() => {
    const loadCharacteristics = async () => {
      try {
        setLoading(true)
        const response = await getPropertyCharacteristics(propertyId)
        if (response.success && response.data) {
          const chars = response.data.characteristics || []
          setCharacteristics(chars)
          setPropertyType(response.data.propertyType || '')
          
          // Initialize formData with characteristic values
          const initialData: { [key: string]: string } = {}
          chars.forEach((char: Characteristic) => {
            initialData[char.name] = char.value?.toString() || ''
          })
          setFormData(initialData)
        } else {
          setError(response.error || 'Failed to load characteristics')
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
      
      // Map characteristic names to the DTO field names
      const characteristicsMap: { [key: string]: string } = {
        'Metros cuadrados construidos': 'builtSquareMeters',
        'Metros cuadrados de terreno': 'landSquareMeters',
        'Dormitorios': 'bedrooms',
        'Baños': 'bathrooms',
        'Espacios de estacionamiento': 'parkingSpaces',
        'Pisos': 'floors',
        'Año de construcción': 'constructionYear',
      }

      const characteristicsData: { [key: string]: number } = {}
      
      characteristics.forEach((char) => {
        const dtoKey = characteristicsMap[char.name]
        if (dtoKey) {
          characteristicsData[dtoKey] = parseFloat(formData[char.name] || '0')
        }
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

  if (characteristics.length === 0) {
    return (
      <section className="space-y-4">
        <header className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
        </header>
        <p className="text-sm text-muted-foreground">No hay características disponibles para este tipo de propiedad.</p>
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
