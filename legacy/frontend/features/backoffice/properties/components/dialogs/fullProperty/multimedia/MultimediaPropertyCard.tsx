'use client'

import React, { useState } from 'react'
import IconButton from '@/shared/components/ui/IconButton/IconButton'
import LazyImage from '@/shared/components/ui/LazyImage'

interface MultimediaPropertyCardProps {
  url: string
  type: 'image' | 'video'
  mainImageUrl?: string
  multimediaId: string
  onDelete: (id: string) => void
  onSetAsMain: (url: string) => void
  isDeleting?: boolean
  isUpdatingMain?: boolean
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
  const isMain = url === mainImageUrl
  const [isRemoving, setIsRemoving] = useState(false)

  const handleDelete = () => {
    setIsRemoving(true)
    setTimeout(() => {
      onDelete(multimediaId)
    }, 300)
  }

  const handleSetAsMain = () => {
    onSetAsMain(url)
  }

  return (
    <div
      className={`bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full ${
        isRemoving ? 'opacity-50' : ''
      }`}
    >
      {/* Media Container */}
      <div className="relative mb-0 overflow-hidden rounded-t-lg">
        {type === 'image' ? (
          <LazyImage
            multimedia={{
              id: multimediaId,
              url: url,
              filename: 'property-multimedia.jpg',
              variants: []
            }}
            variantType="full"
            alt="Property multimedia"
            sizes="100vw"
            className="w-full aspect-video object-cover"
            maintainAspectRatio={true}
          />
        ) : (
          <video
            src={url}
            className="w-full aspect-video object-cover bg-black"
          />
        )}

        {/* Main Multimedia Badge */}
        {isMain && (
          <div className="absolute top-2 left-2 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
            Principal
          </div>
        )}

        {/* File Type Badge */}
        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium">
          {type === 'image' ? 'IMG' : 'VID'}
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex justify-between items-center">
        {/* Right: Buttons */}
        <div className="flex ml-auto">
          {/* Set as Main Button - Only show if NOT main */}
          {!isMain && (
            <IconButton
              icon="star_outline"
              variant="text"
              onClick={handleSetAsMain}
              disabled={isUpdatingMain || isDeleting}
              title="Marcar como principal"
            />
          )}

          {/* Delete Button */}
          <IconButton
            icon="delete"
            variant="text"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Eliminar"
            className="text-red-500 hover:text-red-700"
          />
        </div>
      </div>
    </div>
  )
}

export default MultimediaPropertyCard
