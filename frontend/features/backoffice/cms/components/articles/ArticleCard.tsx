'use client';

import React, { useState } from 'react';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import Switch from '@/shared/components/ui/Switch/Switch';
import LazyImage from '@/shared/components/ui/LazyImage';
import { env } from '@/lib/env';
import { useAlert } from '@/providers/AlertContext';
import {
  toggleArticleActive,
  type Article,
} from '@/features/backoffice/cms/actions/articles.action';

export interface ArticleCardProps {
  article: Article;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
}

const normalizeMediaUrl = (url?: string): string | undefined => {
  if (!url) return undefined;

  const trimmed = url.trim();
  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    if (trimmed.startsWith('/')) {
      return `${env.backendApiUrl.replace(/\/$/, '')}${trimmed}`;
    }
    return trimmed;
  }
};

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onEdit, onDelete }) => {
  const alert = useAlert();
  const [isActive, setIsActive] = useState(article.isActive);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleActiveChange = async (checked: boolean) => {
    if (isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    try {
      const result = await toggleArticleActive(article.id, checked);

      if (result.success) {
        setIsActive(checked);
        alert.success(
          checked ? 'Artículo activado correctamente' : 'Artículo desactivado correctamente'
        );
      } else {
        alert.error(result.error || 'Error al actualizar el estado del artículo');
      }
    } catch (error) {
      alert.error('Error al actualizar el estado del artículo');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
      <div className="w-full overflow-hidden">
        {article.multimedia ? (
          <LazyImage
            multimedia={article.multimedia}
            variantType="thumbnail-lg"
            alt={article.title}
            sizes="100vw"
            className="w-full aspect-video object-cover"
            maintainAspectRatio={true}
          />
        ) : article.multimediaUrl ? (
          <LazyImage
            multimedia={{
              id: article.id,
              url: normalizeMediaUrl(article.multimediaUrl) || '',
              filename: 'article-image.jpg',
              variants: []
            }}
            variantType="thumbnail-lg"
            alt={article.title}
            sizes="100vw"
            className="w-full aspect-video object-cover"
            maintainAspectRatio={true}
          />
        ) : (
          <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-400" style={{ fontSize: '40px' }}>
              image_not_supported
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2 flex-1 py-2 px-4">
        <h3 className="text-lg font-semibold text-foreground line-clamp-2">{article.title}</h3>

        {article.subtitle && (
          <p className="text-sm text-muted-foreground line-clamp-2">{article.subtitle}</p>
        )}

        <p className="text-sm text-foreground line-clamp-3">{article.text}</p>
      </div>

      <div className="flex justify-between items-center gap-2 mt-2 px-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs border border-border text-muted-foreground px-3 py-1.5 rounded-full bg-card">
            {article.category}
          </span>
          <Switch checked={isActive} onChange={handleActiveChange} />
        </div>

        <div className="flex gap-2">
          <IconButton
            icon="edit"
            variant="text"
            onClick={() => onEdit(article)}
            ariaLabel="Editar artículo"
          />
          <IconButton
            icon="delete"
            variant="text"
            onClick={() => onDelete(article)}
            className="text-red-500"
            ariaLabel="Eliminar artículo"
          />
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
