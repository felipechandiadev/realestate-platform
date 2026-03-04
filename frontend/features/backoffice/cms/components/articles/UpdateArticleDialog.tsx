'use client';

import { useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import UpdateBaseForm, { type BaseUpdateFormField } from '@/shared/components/ui/BaseForm/UpdateBaseForm';
import { updateArticle, type Article } from '@/features/backoffice/cms/actions/articles.action';
import { ArticleCategory } from '@/shared/types/article';
import { useAlert } from '@/providers/AlertContext';

export interface UpdateArticleDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  article: Article | null;
}

const UpdateArticleDialog: React.FC<UpdateArticleDialogProps> = ({
  open,
  onClose,
  onSuccess,
  article,
}) => {
  const alert = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = Object.values(ArticleCategory).map((category) => ({
    id: category,
    label: category,
  }));

  const formFields: BaseUpdateFormField[] = [
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      required: true,
    },
    {
      name: 'subtitle',
      label: 'Subtítulo',
      type: 'text',
    },
    {
      name: 'text',
      label: 'Contenido',
      type: 'textarea',
      required: true,
      rows: 12,
    },
    {
      name: 'category',
      label: 'Categoría',
      type: 'select',
      required: true,
      options: categoryOptions,
    },
    {
      name: 'multimediaUrl',
      label: 'Imagen',
      type: 'image',
      variant: 'banner',
      currentUrl: article?.multimediaUrl,
      currentType: 'image',
      acceptedTypes: ['image/*'],
      maxSize: 5,
      aspectRatio: '16:9',
      buttonText: 'Cambiar imagen',
      labelText: 'Imagen del artículo',
      previewSize: 'lg',
    },
  ];

  const initialState = article
    ? {
        title: article.title || '',
        subtitle: article.subtitle || '',
        text: article.text || '',
        category: article.category,
        multimediaUrl: article.multimediaUrl || '',
      }
    : {
        title: '',
        subtitle: '',
        text: '',
        category: ArticleCategory.COMPRAR,
        multimediaUrl: '',
      };

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!article) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', String(values.title || ''));
      formDataToSend.append('subtitle', String(values.subtitle || ''));
      formDataToSend.append('text', String(values.text || ''));
      formDataToSend.append('category', String(values.category || ''));

      if (values.multimediaUrlFile instanceof File) {
        formDataToSend.append('image', values.multimediaUrlFile);
      }

      const result = await updateArticle(article.id, formDataToSend);

      if (result.success) {
        alert.success('Artículo actualizado exitosamente');
        onClose();
        onSuccess();
      } else {
        alert.error(result.error || 'Error al actualizar artículo');
      }
    } catch (err) {
      alert.error('Error interno del servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Editar Artículo"
      maxWidth="md"
    >
      {article ? (
        <UpdateBaseForm
          title=""
          fields={formFields}
          initialState={initialState}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Actualizar Artículo"
          cancelButton={true}
          onCancel={onClose}
        />
      ) : (
        <div className="flex justify-center py-8">
          <div className="text-muted-foreground">Cargando...</div>
        </div>
      )}
    </Dialog>
  );
};

export default UpdateArticleDialog;
