'use client';

import { useCallback, useEffect, useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField';
import { Switch } from '@/shared/components/ui/Switch';
import {
  useCreateArticle,
  useUpdateArticle,
} from '@/features/backoffice/cms/hooks';
import { ArticleSchema } from '@/features/backoffice/cms/validation';
import type { Article, CreateArticleInput } from '@/features/backoffice/cms/types';

interface ArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article?: Article | null;
  onSuccess?: () => void;
}

/**
 * Article Create/Edit Dialog Component
 *
 * Shared dialog for creating and editing CMS articles
 * Auto-generates slug from title
 *
 * @param {ArticleDialogProps} props - Component props
 * @returns {React.ReactNode} Dialog component
 */
export function ArticleDialog({
  open,
  onOpenChange,
  article,
  onSuccess,
}: ArticleDialogProps) {
  const [formData, setFormData] = useState<Partial<CreateArticleInput>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    published: false,
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const { mutate: createArticle, isPending: isCreating } = useCreateArticle();
  const { mutate: updateArticle, isPending: isUpdating } = useUpdateArticle();

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        published: article.published,
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        published: false,
      });
    }
    setErrors({});
  }, [article, open]);

  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }, []);

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: generateSlug(value),
    }));
    if (errors.title) delete errors.title;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = ArticleSchema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    if (article?.id) {
      updateArticle(
        { id: article.id, data: result.data },
        {
          onSuccess: () => {
            onOpenChange(false);
            onSuccess?.();
          },
          onError: (error) => {
            setErrors({
              submit: [
                error instanceof Error
                  ? error.message
                  : 'Error al actualizar artículo',
              ],
            });
          },
        }
      );
    } else {
      createArticle(result.data, {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error) => {
          setErrors({
            submit: [
              error instanceof Error
                ? error.message
                : 'Error al crear artículo',
            ],
          });
        },
      });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={article ? 'Editar Artículo' : 'Crear Artículo'}
      description={
        article
          ? `Editando: ${article.title}`
          : 'Crear nuevo artículo para el blog'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <TextField
          label="Título*"
          value={formData.title || ''}
          onChange={(e) => handleTitleChange(e.target.value)}
          error={errors.title?.[0]}
        />

        <TextField
          label="Slug*"
          value={formData.slug || ''}
          onChange={(e) => handleInputChange('slug', e.target.value)}
          placeholder="auto-generado"
          error={errors.slug?.[0]}
        />

        <TextField
          label="Extracto"
          value={formData.excerpt || ''}
          onChange={(e) => handleInputChange('excerpt', e.target.value)}
          multiline
          rows={2}
          error={errors.excerpt?.[0]}
        />

        <TextField
          label="Contenido*"
          value={formData.content || ''}
          onChange={(e) => handleInputChange('content', e.target.value)}
          multiline
          rows={8}
          error={errors.content?.[0]}
        />

        <div className="flex items-center gap-3">
          <Switch
            checked={formData.published || false}
            onChange={(checked) => handleInputChange('published', checked)}
          />
          <label className="text-sm font-medium">Publicado</label>
        </div>

        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700 text-sm">{errors.submit[0]}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button variant="primary" type="submit" loading={isPending}>
            {article ? 'Guardar Cambios' : 'Crear Artículo'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
