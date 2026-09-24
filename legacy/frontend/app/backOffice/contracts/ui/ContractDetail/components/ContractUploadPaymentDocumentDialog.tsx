'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import Select from '@/shared/components/ui/Select/Select';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import FileUploader from '@/shared/components/ui/FileUploader/FileUploader';
import AutoComplete, { type Option as AutoCompleteOption } from '@/shared/components/ui/AutoComplete/AutoComplete';
import type { DocumentType } from '@/features/backoffice/contracts/actions/documentTypes.action';

type PaymentForUpload = {
  id?: string;
  amount: number | string;
  type: string;
  date?: string | Date;
  description?: string;
  [key: string]: unknown;
};

interface ContractUploadPaymentDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  payment: PaymentForUpload | null;
  documentTypes: DocumentType[];
  loadingDocumentTypes: boolean;
  submitting: boolean;
  onSubmit: (payload: {
    documentTypeId: string;
    title: string;
    notes?: string;
    file: File;
    personId?: string;
  }) => Promise<void>;
  getPaymentTypeLabel: (type: string) => string;
  currency: 'CLP' | 'UF';
  participants?: Array<{
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
  }>;
  getRoleLabel: (role: string) => string;
}

export default function ContractUploadPaymentDocumentDialog({
  open,
  onClose,
  payment,
  documentTypes,
  loadingDocumentTypes,
  submitting,
  onSubmit,
  getPaymentTypeLabel,
  currency,
  participants = [],
  getRoleLabel,
}: ContractUploadPaymentDocumentDialogProps) {
  const [documentTypeId, setDocumentTypeId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [selectedParticipant, setSelectedParticipant] = useState<AutoCompleteOption | null>(null);

  useEffect(() => {
    if (open) {
      setDocumentTypeId(null);
      setTitle('');
      setNotes('');
      setFile(null);
      setFormError('');
      setSelectedParticipant(null);
    }
  }, [open]);

  const paymentSummary = useMemo(() => {
    if (!payment) {
      return null;
    }

    const amount = typeof payment.amount === 'number' ? payment.amount : Number(payment.amount);
    const localizedAmount = Number.isFinite(amount)
      ? amount.toLocaleString('es-CL', currency === 'UF'
          ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          : { minimumFractionDigits: 0, maximumFractionDigits: 0 })
      : payment.amount;

    const formattedDate = payment.date
      ? new Date(payment.date).toLocaleDateString('es-CL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : undefined;

    return {
      typeLabel: getPaymentTypeLabel(payment.type),
      amountLabel: `${currency} ${localizedAmount}`,
      dateLabel: formattedDate,
      description: payment.description,
    };
  }, [payment, currency, getPaymentTypeLabel]);

  const canSubmit = Boolean(documentTypeId && title.trim() && file && !submitting && !loadingDocumentTypes);

  const handleSubmit = async () => {
    if (!documentTypeId || !file || !title.trim()) {
      setFormError('Selecciona tipo de documento, título y archivo.');
      return;
    }

    setFormError('');
    await onSubmit({
      documentTypeId,
      title: title.trim(),
      notes: notes.trim() || undefined,
      file,
      personId: selectedParticipant ? String(selectedParticipant.id) : undefined,
    });
  };

  const documentTypeOptions = useMemo(() => 
    documentTypes.map((type) => ({ id: type.id, label: type.name })),
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

        const rawNameCandidates = [
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

        const displayName = rawNameCandidates.find((name) => (name ? name.trim().length > 0 : false))?.trim() || participantId;
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
        const labelParts = [
          primaryLabel,
          roleLabel ? `• ${roleLabel}` : null,
        ].filter((part): part is string => Boolean(part));

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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Adjuntar documento al pago"
      size="md"
      hideActions
      scroll="body"
    >
      <div className="space-y-6">
        {paymentSummary ? (
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase text-muted-foreground tracking-wide mb-2">Pago seleccionado</p>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{paymentSummary.typeLabel}</p>
              <p className="text-sm text-muted-foreground">Monto: {paymentSummary.amountLabel}</p>
              {paymentSummary.dateLabel && (
                <p className="text-sm text-muted-foreground">Fecha: {paymentSummary.dateLabel}</p>
              )}
              {paymentSummary.description && (
                <p className="text-xs text-muted-foreground">{paymentSummary.description}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Selecciona un pago para adjuntar documentos.
          </div>
        )}

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
              Agrega participantes al contrato para asociarlos a los comprobantes.
            </p>
          )}

          <TextField
            label="Título"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            placeholder="Ej: Comprobante transferencia inicial"
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

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Archivo</p>
            <FileUploader
              onFileSelect={setFile}
              accept="application/pdf,image/*"
              disabled={submitting}
            />
          </div>
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
            No hay tipos de documento disponibles. Crea alguno antes de adjuntar comprobantes.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="text" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="containedPrimary"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
                Subiendo...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">upload_file</span>
                Adjuntar
              </span>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
