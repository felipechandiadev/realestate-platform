'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ImageOff, Image } from 'lucide-react';
import { IconButton, Alert } from '@realestate/ui';
import { MultimediaUpdaterProps } from './types';
import { MultimediaSingleSlot } from '../Multimedia/MultimediaSingleSlot';

const MultimediaUpdater: React.FC<MultimediaUpdaterProps> = ({
  currentUrl,
  currentType,
  onFileChange,
  acceptedTypes = ['image/*', 'video/*'],
  maxSize = 5,
  aspectRatio = '1:1',
  variant = 'default',
  avatarSize = 'md',
  actionPlacement = 'below',
  allowDragDrop = false,
  className = '',
  previewSize = 'md',
  disabled = false,
  labelText = '',
}) => {
  if (variant === 'avatar') {
    return (
      <div className={className.trim() || undefined}>
        <MultimediaSingleSlot
          variant="avatar"
          currentUrl={currentUrl}
          currentType={currentType === 'video' ? 'video' : 'image'}
          acceptedTypes={acceptedTypes}
          maxSizeMb={maxSize}
          avatarSize={avatarSize}
          actionPlacement={actionPlacement}
          allowDragDrop={allowDragDrop}
          disabled={disabled}
          onFileChange={onFileChange}
        />
      </div>
    );
  }

  return (
    <MultimediaUpdaterLegacy
      currentUrl={currentUrl}
      currentType={currentType}
      onFileChange={onFileChange}
      acceptedTypes={acceptedTypes}
      maxSize={maxSize}
      aspectRatio={aspectRatio}
      variant={variant}
      allowDragDrop={allowDragDrop}
      className={className}
      previewSize={previewSize}
      disabled={disabled}
      labelText={labelText}
    />
  );
};

/** Banner / default paths (unchanged behavior). */
function MultimediaUpdaterLegacy({
  currentUrl,
  currentType,
  onFileChange,
  acceptedTypes = ['image/*', 'video/*'],
  maxSize = 5,
  aspectRatio = '1:1',
  variant = 'default',
  allowDragDrop = false,
  className = '',
  previewSize = 'md',
  disabled = false,
  labelText = '',
}: MultimediaUpdaterProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!selectedFile && currentUrl) {
      setPreviewUrl(currentUrl);
      setImageError(false);
    }
  }, [currentUrl, selectedFile]);

  const getPreviewSizeClasses = () => {
    switch (previewSize) {
      case 'xs':
        return 'w-full max-w-[120px] mx-auto';
      case 'sm':
        return 'w-full max-w-[180px] mx-auto';
      case 'lg':
        return 'w-full max-w-[320px] mx-auto';
      case 'xl':
        return 'w-full max-w-[420px] mx-auto';
      case 'md':
      default:
        return 'w-full';
    }
  };

  const previewContainerClass = getPreviewSizeClasses();

  const validateFile = (file: File): boolean => {
    if (!acceptedTypes.some((type: string) => file.type.match(type))) {
      setError(`Tipo de archivo no permitido. Permitidos: ${acceptedTypes.join(', ')}`);
      return false;
    }
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Archivo demasiado grande. Máximo: ${maxSize}MB`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleFileSelect = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setImageError(false);
        onFileChange?.(file);
      }
    },
    [onFileChange, acceptedTypes, maxSize],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (allowDragDrop) {
      e.preventDefault();
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    if (allowDragDrop) {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileSelect(file);
    }
  };

  const renderPreview = () => {
    if (!previewUrl) {
      return <div className="flex h-full items-center justify-center text-gray-400">Sin multimedia</div>;
    }
    if (imageError) {
      return (
        <div className="flex h-full items-center justify-center">
          <ImageOff className="text-gray-400" size={48} />
        </div>
      );
    }
    const commonClasses = 'h-full w-full rounded-lg object-cover';
    if (currentType === 'video' || selectedFile?.type.startsWith('video/')) {
      return (
        <video className={commonClasses} controls>
          <source src={previewUrl} type={selectedFile?.type || 'video/mp4'} />
        </video>
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={previewUrl}
        alt="Preview"
        className={commonClasses}
        onError={() => setImageError(true)}
        onLoad={() => setImageError(false)}
      />
    );
  };

  return (
    <div className={`mt-2 space-y-4 ${className} ${disabled ? 'pointer-events-none opacity-60' : ''}`.trim()}>
      {variant === 'banner' ? (
        <div className="flex flex-col items-center gap-4">
          <div
            className={`relative flex aspect-video w-full max-w-[480px] cursor-pointer items-center justify-center rounded-lg transition-colors hover:border-blue-500 ${aspectRatio === '1:1' ? 'aspect-square' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              renderPreview()
            ) : (
              <div className="flex items-center justify-center gap-6">
                <Image size={64} className="text-secondary" />
                <IconButton
                  icon="add"
                  variant="containedSecondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  ariaLabel="Seleccionar imagen"
                />
              </div>
            )}
            {allowDragDrop && isDragOver && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-blue-500 bg-opacity-50 font-semibold text-white">
                Arrastra aquí
              </div>
            )}
          </div>
          {previewUrl && (
            <IconButton
              icon="refresh"
              variant="containedSecondary"
              onClick={() => fileInputRef.current?.click()}
              ariaLabel="Cambiar imagen"
            />
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col items-start gap-0.5">
            {labelText && !previewUrl && (
              <span className="text-xs font-normal leading-none text-foreground">{labelText}</span>
            )}
            <IconButton
              icon="add"
              variant="containedSecondary"
              onClick={() => fileInputRef.current?.click()}
              ariaLabel="Subir multimedia"
            />
          </div>
          {previewUrl && <div className={`${previewContainerClass} relative`}>{renderPreview()}</div>}
        </>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}

export default MultimediaUpdater;
