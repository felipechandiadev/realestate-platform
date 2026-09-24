'use client'

import IconButton from '@/shared/components/ui/IconButton/IconButton';
import Switch from '@/shared/components/ui/Switch/Switch';
import { Article, toggleArticleActive } from '@/features/backoffice/cms/actions/articles.action';
import React, { useState } from 'react';
import { useAlert } from '@/shared/hooks/useAlert';

export interface ArticleCardProps {
  article: Article;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
  onRemove?: (articleId: string) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onEdit,
  onDelete,
  onRemove,
}) => {
  const [isActive, setIsActive] = useState(article.isActive);
  const [loading, setLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { showAlert } = useAlert();

  const handleActiveChange = async (checked: boolean) => {
    setLoading(true);
    try {
      const result = await toggleArticleActive(article.id, checked);
      
      if (result.success) {
        setIsActive(checked);
        showAlert({
          message: checked ? 'Artículo activado correctamente' : 'Artículo desactivado correctamente',
          type: 'success',
          duration: 3000
        });
        
        // Si se desactiva, remover la tarjeta después de 2 segundos
        if (!checked) {
          setIsRemoving(true);
          setTimeout(() => {
            onRemove?.(article.id);
          }, 2000);
        }
      } else {
        showAlert({
          message: result.error || 'Error al actualizar el artículo',
          type: 'error',
          duration: 3000
        });
        // Revertir el cambio en caso de error
        setIsActive(!checked);
      }
    } catch (error) {
      showAlert({
        message: 'Error al actualizar el artículo',
        type: 'error',
        duration: 3000
      });
      // Revertir el cambio en caso de error
      setIsActive(!checked);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-card rounded-lg p-6 border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col h-full ${isRemoving ? 'opacity-50' : ''}`}>
      {/* Imagen */}
      {article.multimediaUrl && (
        <div className="mb-4 overflow-hidden rounded-lg">
          <img
            src={article.multimediaUrl}
            alt={article.title}
            className="w-full aspect-video object-cover"
          />
        </div>
      )}

      {/* Contenido */}
      <div className="space-y-2 flex-1">
        <h3 className="text-lg font-semibold text-foreground">{article.title}</h3>
        {article.subtitle && (
          <p className="text-sm text-muted-foreground">{article.subtitle}</p>
        )}
        <p className="text-sm text-foreground line-clamp-3">{article.text}</p>
      </div>

      {/* Acciones - Siempre al fondo */}
      <div className="flex justify-between items-center gap-2 mt-4 ">
        {/* Switch y Categoría a la izquierda */}
        <div className="flex items-center gap-2">
          <span className="text-xs border border-border text-primary px-2 py-1 rounded-full">
            {article.category}
          </span>
          <Switch
            checked={isActive}
            onChange={handleActiveChange}
          />
        </div>

        {/* Botones a la derecha */}
        <div className="flex gap-2">
          <IconButton
            icon="edit"
            variant="text"
            onClick={() => onEdit(article)}
            aria-label="Editar artículo"
          />
          <IconButton
            icon="delete"
            variant="text"
            onClick={() => onDelete(article)}
            className="text-red-500"
            aria-label="Eliminar artículo"
          />
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;