'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Image as ImageIcon, User } from 'lucide-react';
import { Alert, IconButton } from '@realestate/ui';

export type MultimediaSingleVariant = 'banner' | 'avatar' | 'logo';
export type MultimediaAvatarSize = 'sm' | 'md' | 'lg';
export type MultimediaAvatarActionPlacement = 'below' | 'edge';

const AVATAR_DIM_CLASS: Record<MultimediaAvatarSize, string> = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-28 w-28',
};

const AVATAR_PLACEHOLDER_ICON: Record<MultimediaAvatarSize, number> = {
  sm: 28,
  md: 40,
  lg: 48,
};

/** Botón edge: escala con el círculo para no verse colgado/chico. */
const AVATAR_EDGE_BUTTON_SIZE: Record<MultimediaAvatarSize, 'xs' | 'sm'> = {
  sm: 'xs',
  md: 'xs',
  lg: 'sm',
};

/** Offset del badge respecto a la esquina SE del círculo. */
const AVATAR_EDGE_OFFSET_CLASS: Record<MultimediaAvatarSize, string> = {
  sm: 'bottom-0 right-0',
  md: '-bottom-0.5 -right-0.5',
  lg: '-bottom-1 -right-1',
};

export type MultimediaSingleSlotProps = {
  variant: MultimediaSingleVariant;
  currentUrl?: string | null;
  currentType?: 'image' | 'video';
  disabled?: boolean;
  allowDragDrop?: boolean;
  acceptedTypes?: string[];
  maxSizeMb?: number;
  /** Solo variant=avatar: tamaño del círculo. Default md. */
  avatarSize?: MultimediaAvatarSize;
  /** Solo variant=avatar: botón debajo (default) o badge en el borde. */
  actionPlacement?: MultimediaAvatarActionPlacement;
  onFileChange?: (file: File | null) => void;
  className?: string;
  'data-test-id'?: string;
};

export function MultimediaSingleSlot({
  variant,
  currentUrl,
  currentType = 'image',
  disabled = false,
  allowDragDrop = true,
  acceptedTypes = ['image/*', 'video/*'],
  maxSizeMb = 9,
  avatarSize = 'md',
  actionPlacement = 'below',
  onFileChange,
  className = '',
  'data-test-id': testId = 'multimedia-single-slot',
}: MultimediaSingleSlotProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    setPreviewUrl(currentUrl ?? null);
  }, [currentUrl]);

  const hasMedia = Boolean(previewUrl?.trim());
  const isAvatarEdge = variant === 'avatar' && actionPlacement === 'edge';

  const openFile = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const validate = (file: File): boolean => {
    if (!acceptedTypes.some((t) => file.type.match(t.replace('*', '.*')))) {
      setError(`Tipo no permitido: ${acceptedTypes.join(', ')}`);
      return false;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Máximo ${maxSizeMb}MB`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleFile = (file: File) => {
    if (!validate(file)) {
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onFileChange?.(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) {
      return;
    }
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const onActionClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    openFile();
  };

  const renderPreview = () => {
    if (!previewUrl) {
      if (variant === 'avatar') {
        return <User className="text-secondary" size={AVATAR_PLACEHOLDER_ICON[avatarSize]} />;
      }
      return <ImageIcon className="text-secondary" size={48} />;
    }
    if (currentType === 'video') {
      return (
        <video
          src={previewUrl}
          className={`h-full w-full object-cover ${variant === 'avatar' ? 'rounded-full' : 'rounded-lg'}`}
          controls
          muted
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={previewUrl}
        alt=""
        className={`h-full w-full object-cover ${variant === 'avatar' ? 'rounded-full' : 'rounded-lg'}`}
      />
    );
  };

  const avatarDim = AVATAR_DIM_CLASS[avatarSize];
  const areaClass =
    variant === 'avatar'
      ? `relative flex ${avatarDim} cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-secondary bg-neutral-100 hover:border-primary ${isAvatarEdge ? '' : 'mx-auto'}`
      : variant === 'logo'
        ? 'relative flex aspect-square w-full max-w-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/25 hover:border-primary'
        : 'relative flex aspect-video w-full max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/25 hover:border-primary';

  const edgeButtonSize = AVATAR_EDGE_BUTTON_SIZE[avatarSize];
  const edgeOffsetClass = AVATAR_EDGE_OFFSET_CLASS[avatarSize];

  const actionButton = (
    <IconButton
      icon={hasMedia ? 'Camera' : 'Plus'}
      variant={isAvatarEdge ? 'secondaryCircle' : 'secondary'}
      size={isAvatarEdge ? edgeButtonSize : 'md'}
      onClick={onActionClick}
      disabled={disabled}
      ariaLabel={hasMedia ? 'Cambiar foto' : 'Agregar foto'}
      data-test-id={`${testId}-action`}
    />
  );

  const dropZone = (
    <div
      className={`${areaClass} ${isDragOver ? 'ring-2 ring-primary' : ''}`}
      onClick={openFile}
      onDragOver={(e) => {
        if (allowDragDrop) {
          e.preventDefault();
          setIsDragOver(true);
        }
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={onDrop}
      data-test-id={`${testId}-preview`}
    >
      {renderPreview()}
    </div>
  );

  return (
    <div
      className={`flex flex-col items-center ${isAvatarEdge ? 'gap-1' : 'space-y-3'} ${disabled ? 'pointer-events-none opacity-60' : ''} ${className}`.trim()}
      data-test-id={testId}
      data-action-placement={variant === 'avatar' ? actionPlacement : undefined}
    >
      {isAvatarEdge ? (
        <div className="relative inline-flex shrink-0 overflow-visible p-0.5">
          {dropZone}
          <div className={`absolute z-[1] ${edgeOffsetClass}`}>
            {actionButton}
          </div>
        </div>
      ) : (
        <>
          {dropZone}
          {actionButton}
        </>
      )}
      <input
        id={inputId}
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        className="hidden"
        disabled={disabled}
        onChange={onInputChange}
      />
      {error ? <Alert variant="error">{error}</Alert> : null}
    </div>
  );
}

export default MultimediaSingleSlot;
