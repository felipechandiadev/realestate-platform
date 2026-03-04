'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DocumentTypeCard from './DocumentTypeCard'
import { TextField } from '@/shared/components/ui/TextField/TextField'
import IconButton from '@/shared/components/ui/IconButton/IconButton'
import Dialog from '@/shared/components/ui/Dialog/Dialog'
import CreateDocumentTypeForm from './CreateDocumentTypeForm'
import { getDocumentTypes, type DocumentType } from '@/features/backoffice/contracts/actions/documentTypes.action'

interface DocumentTypeListProps {
  initialDocumentTypes: DocumentType[];
  initialSearch?: string;
}

export default function DocumentTypeList({ 
  initialDocumentTypes, 
  initialSearch = '' 
}: DocumentTypeListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(initialDocumentTypes)
  const [filteredTypes, setFilteredTypes] = useState<DocumentType[]>(initialDocumentTypes)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    const query = searchParams.get('search') || ''
    setSearchQuery(query)
  }, [searchParams])

  useEffect(() => {
    filterDocumentTypes()
  }, [documentTypes, searchQuery])

  const loadDocumentTypes = async () => {
    setIsLoading(true)
    try {
      const result = await getDocumentTypes()
      if (result && Array.isArray(result)) {
        setDocumentTypes(result)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const filterDocumentTypes = () => {
    if (!searchQuery.trim()) {
      setFilteredTypes(documentTypes)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = documentTypes.filter(
      (type) =>
        type.name.toLowerCase().includes(query) ||
        type.description?.toLowerCase().includes(query)
    )
    setFilteredTypes(filtered)
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    router.push(`?${params.toString()}`)
  }

  const handleCreateSuccess = () => {
    setShowCreateDialog(false)
    loadDocumentTypes()
  }

  return (
    <div className="w-full">
      {/* Primera fila: botón agregar y búsqueda */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <div>
          <IconButton
            aria-label="Agregar tipo de documento"
            variant="containedPrimary"
            onClick={() => setShowCreateDialog(true)}
            icon="add"
            size={'sm'}
          />
        </div>
        <div className="w-full max-w-sm">
          <TextField
            label="Buscar"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            startIcon="search"
            placeholder="Buscar tipos de documentos..."
          />
        </div>
      </div>
      {/* Grid de tarjetas: 3 por fila */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-background rounded-lg border border-border shadow-sm p-6 space-y-4"
            >
              <div className="h-6 bg-neutral animate-pulse rounded w-3/4" />
              <div className="h-4 bg-neutral animate-pulse rounded w-full" />
              <div className="h-4 bg-neutral animate-pulse rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : filteredTypes.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-muted mb-4 block">
            description
          </span>
          <p className="text-lg font-medium mb-2 text-foreground">
            {searchQuery
              ? `No se encontraron tipos de documentos para "${searchQuery}"`
              : 'No hay tipos de documentos registrados'}
          </p>
          {searchQuery && (
            <p className="text-sm text-muted">
              Intenta con otros términos de búsqueda o crea un nuevo tipo.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full items-stretch">
          {filteredTypes.map((documentType) => (
            <DocumentTypeCard
              key={documentType.id}
              documentType={documentType}
              onUpdate={loadDocumentTypes}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        title="Crear Tipo de Documento"
        size="lg"
      >
        <CreateDocumentTypeForm onSuccess={handleCreateSuccess} />
      </Dialog>
    </div>
  )
}

