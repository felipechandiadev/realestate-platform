'use client';

import React, { useRef, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button/Button';

type FileUploaderProps = {
  onFileSelect?: (file: File | null) => void;
  onFilesSelected?: (files: File[]) => void;
  onUploadSuccess?: (url: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  maxSize?: number; // in bytes
  disabled?: boolean;
  multiple?: boolean;
  label?: string;
  currentFileUrl?: string;
};

export default function FileUploader({
  onFileSelect,
  onFilesSelected,
  onUploadSuccess,
  onChange,
  accept = '*/*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  disabled = false,
  multiple = false,
  label,
  currentFileUrl,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    const file = e.target.files?.[0] || null;
    setError('');

    if (file) {
      // Validate file size
      if (maxSize && file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
        setError(`El archivo excede el tamaño máximo de ${maxSizeMB} MB`);
        setSelectedFile(null);
        onFileSelect?.(null);
        return;
      }

      setSelectedFile(file);
      onFileSelect?.(file);
      onFilesSelected?.(Array.from(e.target.files ?? [file]));
      onUploadSuccess?.(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      onFileSelect?.(null);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setError('');
    onFileSelect?.(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
        id="file-uploader-input"
      />

      {!selectedFile ? (
        <label
          htmlFor="file-uploader-input"
          className={`
            flex flex-col items-center justify-center
            w-full h-32 px-4 py-6
            border-2 border-dashed rounded-lg
            cursor-pointer
            transition-transform
            ${
              disabled
                ? 'border-muted bg-muted cursor-not-allowed'
                : 'group border-border bg-background'
            }
          `}
        >
          <Upload size={36} className="text-muted-foreground mb-2 transition-transform group-hover:scale-110" />
          <p className="text-sm text-muted-foreground text-center transition-transform group-hover:scale-[1.03]">
            <span className="font-semibold">{label || 'Haga clic para seleccionar'}</span>
            <br />
            o arrastre un archivo aquí
          </p>
          <p className="text-xs text-muted-foreground mt-1 transition-transform group-hover:scale-[1.03]">
            Tamaño máximo: {formatFileSize(maxSize)}
          </p>
        </label>
      ) : (
        <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-background">
          <div className="flex items-center gap-3">
            <FileText size={24} className="text-blue-500" />
            <div>
              <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <Button
            variant="text"
            onClick={handleClear}
            disabled={disabled}
            className="text-red-500 hover:text-red-600"
          >
            <X size={20} />
          </Button>
        </div>
      )}

      {!selectedFile && currentFileUrl && (
        <p className="text-xs text-muted-foreground">Archivo actual cargado</p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
