import { useState, useEffect } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { UpdateBaseForm, type BaseUpdateFormField } from '@/shared/components/ui/BaseForm';
import { updateArticle, Article } from '@/features/backoffice/cms/actions/articles.action';
import { ArticleCategory } from '@/shared/types/article';
import { useAlert } from '@/shared/hooks/useAlert';

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
  const { showAlert } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = Object.values(ArticleCategory).map((category) => ({
    id: category as any,
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

  const initialState = article ? {
    title: article.title || '',
    subtitle: article.subtitle || '',
    text: article.text || '',
    category: article.category,
    multimediaUrl: article.multimediaUrl || '',
  } : {
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

      // Si hay un archivo de imagen nuevo (fromultimediaUpdater)
      if (values.multimediaUrlFile instanceof File) {
        formDataToSend.append('image', values.multimediaUrlFile);
      }

      const result = await updateArticle(article.id, formDataToSend);

      if (result.success) {
        showAlert({
          message: 'Artículo actualizado exitosamente',
          type: 'success',
          duration: 3000,
        });
        onClose();
        onSuccess();
      } else {
        showAlert({
          message: result.error || 'Error al actualizar artículo',
          type: 'error',
          duration: 3000,
        });
      }
    } catch (err) {
      showAlert({
        message: 'Error interno del servidor',
        type: 'error',
        duration: 3000,
      });
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
          title=''
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