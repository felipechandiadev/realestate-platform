import { useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { deleteArticle, Article } from '@/features/backoffice/cms/actions/articles.action';
import { useAlert } from '@/providers/AlertContext';

export interface DeleteArticleDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  article: Article | null;
}

const DeleteArticleDialog: React.FC<DeleteArticleDialogProps> = ({
  open,
  onClose,
  onSuccess,
  article,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useAlert();

  const handleClose = () => {
    onClose();
  };

  const handleConfirmDelete = async () => {
    if (!article) return;

    setIsSubmitting(true);
    try {
      const result = await deleteArticle(article.id);
      if (result.success) {
        success('Artículo eliminado exitosamente');
        handleClose();
        onSuccess();
      } else {
        error(result.error || 'Error al eliminar artículo');
      }
    } catch (err) {
      error('Error interno del servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Eliminar Artículo"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <p className="text-foreground">
          ¿Estás seguro de que quieres eliminar el artículo <strong>"{article?.title}"</strong>?
        </p>
        <p className="text-sm text-muted-foreground">
          Esta acción no se puede deshacer.
        </p>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="primary"
            onClick={handleConfirmDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default DeleteArticleDialog;