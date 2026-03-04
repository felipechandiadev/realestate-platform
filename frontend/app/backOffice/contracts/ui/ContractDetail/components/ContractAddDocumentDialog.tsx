'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import Select from '@/shared/components/ui/Select/Select';
import AutoComplete, { type Option as AutoCompleteOption } from '@/shared/components/ui/AutoComplete/AutoComplete';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import type { DocumentType } from '@/features/backoffice/contracts/actions/documentTypes.action';

interface ContractParticipantOption {
  personId?: string;
  personName?: string;
  personDni?: string;
  role?: string;
  person?: {
    name?: string;
    dni?: string;
    firstName?: string;
    lastName?: string;
    nationalId?: string;
    documentNumber?: string;
    rut?: string;
    personalInfo?: {
      firstName?: string;
      lastName?: string;
      dni?: string;
      rut?: string;
    };
  };
}

interface ContractAddDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  documentTypes: DocumentType[];
  loadingDocumentTypes: boolean;
  submitting: boolean;
  onSubmit: (payload: {
    documentTypeId: string;
    title: string;
    notes?: string;
    personId?: string;
  }) => Promise<void>;
  participants?: ContractParticipantOption[];
  getRoleLabel: (role: string) => string;
}

export default function ContractAddDocumentDialog({
  open,
  onClose,
  documentTypes,
  loadingDocumentTypes,
  submitting,
  onSubmit,
  participants = [],
  getRoleLabel,
}: ContractAddDocumentDialogProps) {
  const [documentTypeId, setDocumentTypeId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string>('');
  const [selectedParticipant, setSelectedParticipant] = useState<AutoCompleteOption | null>(null);

  useEffect(() => {
    if (open) {
      setDocumentTypeId(null);
      setTitle('');
      setNotes('');
      setFormError('');
      setSelectedParticipant(null);
    }
  }, [open]);

  const documentTypeOptions = useMemo(
    () => documentTypes.map((type) => ({ id: type.id, label: type.name })),
    [documentTypes],
  );

  const participantOptions = useMemo<AutoCompleteOption[]>(() => {
    if (!participants || participants.length === 0) {
      return [];
    }

    const unique = new Map<string, AutoCompleteOption>();

    participants.forEach((participant) => {
      const participantId = participant?.personId;
      if (!participantId || unique.has(participantId)) {
        return;
      }

      const nameCandidates = [
        participant.personName,
        participant.person?.name,
        [participant.person?.firstName, participant.person?.lastName].filter(Boolean).join(' ').trim(),
        [
          participant.person?.personalInfo?.firstName,
          participant.person?.personalInfo?.lastName,
        ]
          .filter(Boolean)
          .join(' ')
          .trim(),
      ];

      const displayName = nameCandidates.find((name) => (name ? name.trim().length > 0 : false))?.trim() || participantId;
      const roleLabel = participant.role ? getRoleLabel(participant.role) : null;

      const dniCandidates = [
        participant.personDni,
        participant.person?.dni,
        participant.person?.nationalId,
        participant.person?.documentNumber,
        participant.person?.rut,
        participant.person?.personalInfo?.dni,
        participant.person?.personalInfo?.rut,
      ];
      const dni = dniCandidates.find((value) => (typeof value === 'string' ? value.trim().length > 0 : false))?.trim();

      const primaryLabel = dni ? `${displayName} - ${dni}` : displayName;
      const labelParts = [primaryLabel, roleLabel ? `• ${roleLabel}` : null].filter(Boolean) as string[];

      unique.set(participantId, {
        id: participantId,
        label: labelParts.join(' '),
      });
    });

    return Array.from(unique.values());
  }, [participants, getRoleLabel]);

  useEffect(() => {
    if (
      selectedParticipant &&
      !participantOptions.some((option) => String(option.id) === String(selectedParticipant.id))
    ) {
      setSelectedParticipant(null);
    }
  }, [participantOptions, selectedParticipant]);

  const canSubmit = Boolean(documentTypeId && title.trim() && !submitting && !loadingDocumentTypes);

  const handleSubmit = async () => {
    if (!documentTypeId || !title.trim()) {
      setFormError('Selecciona un tipo de documento y agrega un título.');
      return;
    }

    setFormError('');
    await onSubmit({
      documentTypeId,
      title: title.trim(),
      notes: notes.trim() || undefined,
      personId: selectedParticipant ? String(selectedParticipant.id) : undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Registrar documento"
      size="md"
      hideActions
      scroll="body"
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">Descripción</p>
          <p className="text-sm text-muted-foreground">
            Crea un registro para hacer seguimiento de documentos pendientes o por recibir. Podrás adjuntar
            el archivo más adelante desde esta misma sección o al validar pagos.
          </p>
        </div>

        <div className="grid gap-4">
          <Select
            label="Tipo de documento"
            placeholder={loadingDocumentTypes ? 'Cargando tipos...' : 'Selecciona tipo'}
            options={documentTypeOptions}
            value={documentTypeId}
            onChange={(value) => setDocumentTypeId(value ? String(value) : null)}
            required
            disabled={loadingDocumentTypes || submitting || documentTypeOptions.length === 0}
          />

          <AutoComplete<AutoCompleteOption>
            label="Persona asociada (opcional)"
            placeholder={participantOptions.length > 0 ? 'Selecciona participante' : 'Sin participantes disponibles'}
            options={participantOptions}
            value={selectedParticipant}
            onChange={(option) => setSelectedParticipant(option)}
            disabled={submitting || participantOptions.length === 0}
          />
          {participantOptions.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Agrega participantes al contrato para asociarlos a los documentos requeridos.
            </p>
          )}

          <TextField
            label="Título"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            placeholder="Ej: DNI del comprador"
            disabled={submitting}
          />

          <TextField
            label="Notas (opcional)"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            type="textarea"
            placeholder="Información adicional para identificar el documento"
            disabled={submitting}
          />
        </div>

        {formError && <p className="text-sm text-red-500">{formError}</p>}

        {loadingDocumentTypes && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
            <span>Cargando tipos de documento...</span>
          </div>
        )}

        {!loadingDocumentTypes && documentTypes.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hay tipos de documento disponibles. Crea alguno antes de registrar documentos.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="text" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
                Guardando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">add</span>
                Registrar
              </span>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
