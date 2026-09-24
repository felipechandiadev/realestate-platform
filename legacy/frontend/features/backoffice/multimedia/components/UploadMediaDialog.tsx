'use client';

import { useCallback, useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import FileUploader from '@/shared/components/ui/FileUploader/FileUploader';
import { useUploadMultimedia } from '@/features/backoffice/multimedia/hooks';

interface UploadMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Upload Media Dialog Component
 *
 * Dialog for uploading media files (images, videos)
 * Supports multiple file upload with validation
 * Shows progress indicator during upload
 *
 * @param {UploadMediaDialogProps} props - Component props
 * @returns {React.ReactNode} Dialog component
 */
export function UploadMediaDialog({
  open,
  onOpenChange,
  onSuccess,
}: UploadMediaDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);

  const { mutate: uploadMedia, isPending } = useUploadMultimedia();

  /**
   * Validate file before upload
   */
  const validateFile = useCallback((file: File): string | null => {
    // Size validation (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return `${file.name}: El archivo excede el tamaño máximo de 100MB`;
    }

    // Type validation
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ];

    if (!allowedTypes.includes(file.type)) {
      return `${file.name}: Tipo de archivo no permitido`;
    }

    return null;
  }, []);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validationErrors: string[] = [];

    // Validate all files
    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setSelectedFiles(fileArray);
  }, [validateFile]);

  /**
   * Handle upload
   */
  const handleUpload = useCallback(() => {
    if (selectedFiles.length === 0) return;

    // Upload files sequentially
    let uploadedCount = 0;

    const uploadNext = (index: number) => {
      if (index >= selectedFiles.length) {
        // All done
        setSelectedFiles([]);
        setUploadProgress({});
        onOpenChange(false);
        onSuccess?.();
        return;
      }

      const file = selectedFiles[index];
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

      uploadMedia(
        { file, documentTypeId: undefined },
        {
          onSuccess: () => {
            setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
            uploadedCount++;
            uploadNext(index + 1);
          },
          onError: (error) => {
            console.error(`Error uploading ${file.name}:`, error);
            setErrors((prev) => [
              ...prev,
              `Error al subir ${file.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            ]);
            uploadNext(index + 1);
          },
        }
      );
    };

    uploadNext(0);
  }, [selectedFiles, uploadMedia, onOpenChange, onSuccess]);

  /**
   * Handle cancel
   */
  const handleCancel = useCallback(() => {
    setSelectedFiles([]);
    setUploadProgress({});
    setErrors([]);
    onOpenChange(false);
  }, [onOpenChange]);

  const isUploading = Object.keys(uploadProgress).length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Subir Archivos Multimedia"
      description="Seleccione imágenes o videos para subir (máx. 100MB por archivo)"
    >
      <div className="space-y-6">
        {/* File Uploader */}
        <FileUploader
          label="Archivos"
          accept="image/*,video/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={isPending || isUploading}
        />

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Archivos seleccionados ({selectedFiles.length}):
            </p>
            <ul className="space-y-1 text-sm">
              {selectedFiles.map((file) => (
                <li key={file.name} className="flex items-center justify-between">
                  <span className="truncate">{file.name}</span>
                  <span className="text-gray-500 ml-2">
                    ({formatFileSize(file.size)})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Subiendo archivos...</p>
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">{fileName}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm font-medium text-red-800 mb-1">Errores:</p>
            <ul className="list-disc list-inside text-sm text-red-700">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isPending || isUploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isPending || isUploading}
          >
            {isUploading ? 'Subiendo...' : 'Subir Archivos'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
