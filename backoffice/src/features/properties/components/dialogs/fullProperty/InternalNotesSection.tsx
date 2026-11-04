'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button, IconButton, TextField } from '@realestate/ui'
import { useAlert } from '@/shared/hooks/useAlert'
import {
  addPropertyInternalNote,
  deletePropertyInternalNote,
  getPropertyInternalNotes,
  type PropertyInternalNote,
} from '@/features/properties/actions/properties.action'
import { LucideIcon } from './LucideIcon'

/** Debe coincidir con MAX_INTERNAL_NOTE_LENGTH del core. */
const MAX_NOTE_LENGTH = 2000

interface InternalNotesSectionProps {
  propertyId: string
}

function formatNoteDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function InternalNotesSection({ propertyId }: InternalNotesSectionProps) {
  const { data: session } = useSession()
  const { showAlert } = useAlert()
  const [notes, setNotes] = useState<PropertyInternalNote[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const currentUserId = (session?.user as { id?: string } | undefined)?.id
  const currentUserRole = (session?.user as { role?: string } | undefined)?.role

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getPropertyInternalNotes(propertyId)
      if (response.success) {
        setNotes(Array.isArray(response.data) ? response.data : [])
      } else {
        showAlert({ type: 'error', message: response.error || 'Error al cargar las notas' })
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
      showAlert({ type: 'error', message: 'Error inesperado al cargar las notas' })
    } finally {
      setLoading(false)
    }
  }, [propertyId, showAlert])

  useEffect(() => {
    if (propertyId) void loadNotes()
  }, [propertyId, loadNotes])

  const trimmedDraft = draft.trim()

  const handleAdd = async () => {
    if (!trimmedDraft || saving) return
    try {
      setSaving(true)
      const response = await addPropertyInternalNote(propertyId, trimmedDraft)
      if (response.success && response.data) {
        setNotes((current) => [...current, response.data as PropertyInternalNote])
        setDraft('')
        showAlert({ type: 'success', message: 'Nota agregada' })
      } else {
        showAlert({ type: 'error', message: response.error || 'Error al agregar la nota' })
      }
    } catch (error) {
      console.error('Error adding note:', error)
      showAlert({ type: 'error', message: 'Error inesperado al guardar' })
    } finally {
      setSaving(false)
    }
  }

  const canDelete = (note: PropertyInternalNote) =>
    currentUserRole === 'ADMIN' || (!!currentUserId && note.authorId === currentUserId)

  const handleDelete = async (note: PropertyInternalNote) => {
    if (!window.confirm('¿Eliminar esta nota? Esta acción no se puede deshacer.')) return
    try {
      setDeletingId(note.id)
      const response = await deletePropertyInternalNote(propertyId, note.id)
      if (response.success) {
        setNotes((current) => current.filter((n) => n.id !== note.id))
        showAlert({ type: 'success', message: 'Nota eliminada' })
      } else {
        showAlert({ type: 'error', message: response.error || 'Error al eliminar la nota' })
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      showAlert({ type: 'error', message: 'Error inesperado al eliminar' })
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="flex justify-center">
          <LucideIcon name="progress_activity" size={20} spin />
        </div>
      </div>
    )
  }

  // Más recientes primero.
  const ordered = [...notes].reverse()

  return (
    <section className="space-y-6 p-1">
      <header className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          NOTAS INTERNAS
        </p>
        <span className="text-xs text-muted-foreground" data-testid="internal-notes-count">
          {notes.length === 1 ? '1 nota' : `${notes.length} notas`}
        </span>
      </header>

      <div className="space-y-3">
        <TextField
          label="Nueva nota"
          value={draft}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setDraft(e.target.value.slice(0, MAX_NOTE_LENGTH))
          }
          placeholder="Escribe aquí detalles importantes, recordatorios o información confidencial sobre esta propiedad..."
          rows={4}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {draft.length} / {MAX_NOTE_LENGTH}
          </span>
          <Button variant="primary" onClick={handleAdd} disabled={!trimmedDraft || saving}>
            {saving ? 'Guardando...' : 'Agregar nota'}
          </Button>
        </div>
      </div>

      {ordered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Aún no hay notas internas. Las notas que agregues quedarán registradas con su autor y fecha.
        </p>
      ) : (
        <ul className="space-y-3" aria-label="Notas internas">
          {ordered.map((note) => (
            <li
              key={note.id}
              data-testid="internal-note"
              className="rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{note.authorName}</p>
                  <p className="text-xs text-muted-foreground">{formatNoteDate(note.createdAt)}</p>
                </div>
                {canDelete(note) ? (
                  <IconButton
                    icon="delete"
                    variant="text"
                    onClick={() => handleDelete(note)}
                    disabled={deletingId === note.id}
                    ariaLabel="Eliminar nota"
                    title="Eliminar nota"
                  />
                ) : null}
              </div>
              <p className="whitespace-pre-wrap break-words text-sm text-foreground">{note.text}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
