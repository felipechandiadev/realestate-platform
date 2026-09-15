'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, LoadingState } from '@realestate/ui';
import MultimediaUpdater from '@/shared/components/ui/FileUploader/MultimediaUpdater';
import { updateUserAvatar } from '@/features/users/actions/users.action';
import { env } from '@/lib/env';
import type { MultimediaAvatarSize } from '@/shared/components/ui/Multimedia/MultimediaSingleSlot';

type UserAvatarFieldProps = {
  userId: string;
  currentAvatarUrl?: string | null;
  onChanged?: () => void;
  disabled?: boolean;
  className?: string;
  size?: MultimediaAvatarSize;
  'data-test-id'?: string;
};

function resolveAvatarUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return `${env.backendApiUrl}${url.startsWith('/') ? url : `/${url}`}`;
}

/**
 * Avatar editable de usuario (admin/agente).
 * UI: MultimediaSingleSlot edge vía MultimediaUpdater.
 * Persistencia: PUT /users/:id/avatar.
 */
export function UserAvatarField({
  userId,
  currentAvatarUrl,
  onChanged,
  disabled = false,
  className = '',
  size = 'md',
  'data-test-id': testId = 'user-avatar-field',
}: UserAvatarFieldProps) {
  const router = useRouter();
  const id = userId?.trim() ?? '';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [updaterKey, setUpdaterKey] = useState(0);

  const displayUrl = localUrl ?? resolveAvatarUrl(currentAvatarUrl);

  const handleFile = useCallback(
    async (file: File | null) => {
      if (!file || !id || busy || disabled) return;
      setBusy(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const result = await updateUserAvatar(id, formData);
        if (!result.success) {
          setError(result.error || 'Error al actualizar el avatar');
          return;
        }
        const nextUrl = result.data?.avatarUrl
          ? resolveAvatarUrl(result.data.avatarUrl)
          : URL.createObjectURL(file);
        setLocalUrl(nextUrl);
        setUpdaterKey((k) => k + 1);
        onChanged?.();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al actualizar el avatar');
      } finally {
        setBusy(false);
      }
    },
    [busy, disabled, id, onChanged, router],
  );

  if (!id) return null;

  return (
    <div
      className={`inline-flex w-fit max-w-none flex-col items-center gap-1 overflow-visible ${className}`.trim()}
      data-test-id={testId}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {error ? (
        <Alert variant="error" className="w-full max-w-[12rem] text-xs">
          {error}
        </Alert>
      ) : null}
      {busy && !displayUrl ? (
        <LoadingState className="flex items-center justify-center py-4" size={12} />
      ) : (
        <div className={`overflow-visible ${busy ? 'pointer-events-none opacity-60' : ''}`}>
          <MultimediaUpdater
            key={`${updaterKey}-${displayUrl ?? 'none'}`}
            currentUrl={displayUrl}
            currentType="image"
            variant="avatar"
            avatarSize={size}
            actionPlacement="edge"
            allowDragDrop
            acceptedTypes={['image/*']}
            maxSize={2}
            disabled={busy || disabled}
            className="mt-0"
            onFileChange={(f) => {
              if (f) void handleFile(f);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default UserAvatarField;
