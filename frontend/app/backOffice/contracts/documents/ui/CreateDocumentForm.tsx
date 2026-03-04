'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useAlert } from '@/shared/hooks/useAlert';
import { useAuth } from '@/app/providers';
import { env } from '@/lib/env';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import Select from '@/shared/components/ui/Select/Select';
import FileUploader from '@/shared/components/ui/FileUploader/FileUploader';
import { Button } from '@/shared/components/ui/Button/Button';
import DotProgress from '@/shared/components/ui/DotProgress/DotProgress';
import type { DocumentType } from '@/features/backoffice/contracts/actions/documentTypes.action';

type DocumentStatus = 'PENDING' | 'UPLOADED' | 'RECIBIDO' | 'REJECTED';

type CreateDocumentFormProps = {
  documentTypes: DocumentType[];
  onClose: () => void;
  onSuccess?: () => void;
};

export default function CreateDocumentForm({
  documentTypes,
  onClose,
  onSuccess,
}: CreateDocumentFormProps) {
  const { showAlert } = useAlert();
  const { user, accessToken } = useAuth();

  const [documentTypeId, setDocumentTypeId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const availableDocumentTypes = useMemo(
    () => documentTypes.filter((type) => type.available !== false),
    [documentTypes],
  );

  useEffect(() => {
    if (!documentTypeId && availableDocumentTypes.length > 0) {
      setDocumentTypeId(availableDocumentTypes[0].id);
    }
  }, [availableDocumentTypes, documentTypeId]);

  useEffect(() => {
    if (documentTypeId && !title) {
      const selectedType = availableDocumentTypes.find((type) => type.id === documentTypeId);
      if (selectedType) {
        setTitle(selectedType.name);
      }
    }
  }, [documentTypeId, title, availableDocumentTypes]);

  const validate = (): boolean => {
    const issues: string[] = [];

    if (!documentTypeId) {
      issues.push('Selecciona un tipo de documento.');
    }

    if (!title.trim()) {
      issues.push('Ingresa un título para el documento.');
    }

    if (!user?.id) {
      issues.push('No se encontró la sesión del usuario.');
    }

    if (!accessToken) {
      issues.push('La sesión expiró. Inicia sesión nuevamente.');
    }

    setErrors(issues);

    if (issues.length > 0) {
      showAlert({
        message: 'No se pudo crear el documento. Revisa los campos e intenta nuevamente.',
        type: 'error',
        duration: 5000,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate() || !documentTypeId || !user?.id || !accessToken) {
      return;
    }

    setIsSubmitting(true);

    try {
      const trimmedTitle = title.trim();
      const trimmedNotes = notes.trim();
      const hasFile = Boolean(file);

      const commonPayload = {
        title: trimmedTitle,
        documentTypeId,
        uploadedById: user.id,
        status: hasFile ? 'UPLOADED' as DocumentStatus : 'PENDING' as DocumentStatus,
        ...(trimmedNotes ? { notes: trimmedNotes } : {}),
      };

      if (hasFile && file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', commonPayload.title);
        formData.append('documentTypeId', commonPayload.documentTypeId);
        formData.append('uploadedById', commonPayload.uploadedById);
        formData.append('status', commonPayload.status);
        formData.append('seoTitle', commonPayload.title);

        if (trimmedNotes) {
          formData.append('notes', trimmedNotes);
        }

        const response = await fetch(`${env.backendApiUrl}/document/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Error ${response.status}`);
        }
      } else {
        const response = await fetch(`${env.backendApiUrl}/document`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(commonPayload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `Error ${response.status}`);
        }
      }

      showAlert({
        message: `Documento "${trimmedTitle}" creado correctamente`,
        type: 'success',
        duration: 3500,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      showAlert({
        message: error instanceof Error ? error.message : 'Error desconocido al crear documento',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <Select
            label="Tipo de documento"
            options={availableDocumentTypes.map((type) => ({
              id: type.id,
              label: type.name,
            }))}
            placeholder={availableDocumentTypes.length > 0 ? 'Seleccione tipo' : 'Sin tipos disponibles'}
            value={documentTypeId}
            onChange={(value) => setDocumentTypeId(typeof value === 'string' ? value : value?.toString() ?? null)}
            required
            disabled={availableDocumentTypes.length === 0}
          />
        </div>

        <div className="sm:col-span-2">
          <TextField
            label="Título"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="document-notes">
            Notas
          </label>
          <textarea
            id="document-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Notas internas, instrucciones o comentarios opcionales"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Archivo</label>
        <FileUploader
          onFileSelect={setFile}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.heic,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/*,text/plain"
          maxSize={20 * 1024 * 1024}
          disabled={isSubmitting}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Formatos soportados: PDF, Office, imágenes y texto plano. Tamaño máximo 20&nbsp;MB.
          <br />
          Si no adjuntas un archivo el documento quedará en estado pendiente automáticamente.
        </p>
      </div>

      {errors.length > 0 && (
        <ul className="space-y-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errors.map((issue, index) => (
            <li key={index}>• {issue}</li>
          ))}
        </ul>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outlined" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <DotProgress size={12} />
              Guardando
            </span>
          ) : (
            'Guardar documento'
          )}
        </Button>
      </div>
    </form>
  );
}
