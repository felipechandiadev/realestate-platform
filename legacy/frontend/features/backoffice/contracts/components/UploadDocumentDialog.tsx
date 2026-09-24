'use client';

import { useCallback, useRef, useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import FileUploader from '@/shared/components/ui/FileUploader/FileUploader';
import { useUploadContractDocument } from '@/features/backoffice/contracts/hooks';
import type { Contract } from '@/features/backoffice/contracts/types';

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: Contract | null;
  onSuccess?: () => void;
}

/**
 * Upload Contract Document Dialog Component
 *
 * Dialog for uploading contract documents
 * Handles file upload and display of uploaded files
 *
 * @param {UploadDocumentDialogProps} props - Component props
 * @returns {React.ReactNode} Dialog component
 */
export function UploadDocumentDialog({
  open,
  onOpenChange,
  contract,
  onSuccess,
}: UploadDocumentDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadDocument, isPending } = useUploadContractDocument();

  const handleFileSelect = useCallback((selectedFiles: File[]) => {
    // Validate file types (PDF, DOCX, etc.)
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
    ];

    const invalidFiles = selectedFiles.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      setErrors(
        `Tipos de archivo no permitidos: ${invalidFiles.map((f) => f.name).join(', ')}`
      );
      return;
    }

    // Validate file size (max 10MB per file)
    const maxSize = 10 * 1024 * 1024;
    const largFiles = selectedFiles.filter((file) => file.size > maxSize);

    if (largFiles.length > 0) {
      setErrors(
        `Archivos demasiado grandes: ${largFiles.map((f) => f.name).join(', ')}`
      );
      return;
    }

    setErrors('');
    setFiles(selectedFiles);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!contract?.id || files.length === 0) return;

      // Upload each file
      files.forEach((file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('contractId', contract.id);

        uploadDocument(formData, {
          onSuccess: () => {
            onSuccess?.();
          },
          onError: (error) => {
            console.error('Error uploading document:', error);
            setErrors(
              error instanceof Error
                ? error.message
                : 'Error al cargar el documento'
            );
          },
        });
      });

      // Reset form
      setFiles([]);
      setErrors('');
      onOpenChange(false);
    },
    [contract?.id, files, uploadDocument, onOpenChange, onSuccess]
  );

  if (!contract?.id) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Subir Documentos"
      description="Adjuntar documentos al contrato"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Uploader */}
        <FileUploader
          onFilesSelected={handleFileSelect}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
          multiple
          maxSize={10 * 1024 * 1024} // 10MB
        />

        {/* Selected Files List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Archivos seleccionados:</h4>
            <ul className="space-y-1">
              {files.map((file) => (
                <li key={file.name} className="text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        setFiles((prev) =>
                          prev.filter((f) => f.name !== file.name)
                        )
                      }
                      size="sm"
                    >
                      Eliminar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Errors */}
        {errors && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700 text-sm">{errors}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isPending}
            disabled={files.length === 0}
          >
            Cargar Documentos
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
