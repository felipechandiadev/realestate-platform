'use client';

import React, { useState } from 'react';
import { IconButton } from '@realestate/ui';

interface MultimediaPropertyCardProps {
  url: string;
  type: 'image' | 'video';
  mainImageUrl?: string;
  multimediaId: string;
  onDelete: (id: string) => void;
  onSetAsMain: (url: string) => void;
  isDeleting?: boolean;
  isUpdatingMain?: boolean;
}

const MultimediaPropertyCard: React.FC<MultimediaPropertyCardProps> = ({
  url,
  type,
  mainImageUrl,
  multimediaId,
  onDelete,
  onSetAsMain,
  isDeleting = false,
  isUpdatingMain = false,
}) => {
  const isMain = url === mainImageUrl;
  const [isRemoving, setIsRemoving] = useState(false);

  const handleDelete = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onDelete(multimediaId);
    }, 300);
  };

  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:shadow-md ${
        isRemoving ? 'opacity-50' : ''
      }`}
    >
      <div className="relative mb-0 overflow-hidden rounded-t-lg">
        {type === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Multimedia de la propiedad"
            className="aspect-video w-full object-cover"
            loading="lazy"
          />
        ) : (
          <video src={url} className="aspect-video w-full bg-black object-cover" />
        )}

        {isMain ? (
          <div className="absolute left-2 top-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
            Principal
          </div>
        ) : null}

        <div className="absolute right-2 top-2 rounded bg-black/50 px-2 py-1 text-xs font-medium text-white">
          {type === 'image' ? 'IMG' : 'VID'}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="ml-auto flex">
          {!isMain ? (
            <IconButton
              icon="star_outline"
              variant="text"
              onClick={() => onSetAsMain(url)}
              disabled={isUpdatingMain || isDeleting}
              ariaLabel="Marcar como principal"
              title="Marcar como principal"
            />
          ) : null}

          <IconButton
            icon="delete"
            variant="text"
            onClick={handleDelete}
            disabled={isDeleting}
            ariaLabel="Eliminar"
            title="Eliminar"
            className="text-red-500 hover:text-red-700"
          />
        </div>
      </div>
    </div>
  );
};

export default MultimediaPropertyCard;
