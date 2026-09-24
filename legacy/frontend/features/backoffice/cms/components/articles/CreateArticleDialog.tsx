'use client';

import { useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import Select from '@/shared/components/ui/Select/Select';
import MultimediaUploader from '@/shared/components/ui/FileUploader/MultimediaUploader';
import { createArticle } from '@/features/backoffice/cms/actions/articles.action';
import { ArticleCategory } from '@/shared/types/article';
import { useAlert } from '@/providers/AlertContext';

export interface CreateArticleDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateArticleDialog: React.FC<CreateArticleDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const alert = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    text: '',
    category: ArticleCategory.COMPRAR,
  });
  const [newImageFile, setNewImageFile] = useState<File[]>([]);

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      text: '',
      category: ArticleCategory.COMPRAR,
    });
    setNewImageFile([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleImageChange = (files: File[]) => {
    setNewImageFile(files);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.text.trim()) {
      alert.error('Título y texto son obligatorios');
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('subtitle', formData.subtitle.trim());
      formDataToSend.append('text', formData.text.trim());
      formDataToSend.append('category', formData.category);

      if (newImageFile.length > 0) {
        formDataToSend.append('image', newImageFile[0]);
      }

      const result = await createArticle(formDataToSend);

      if (result.success) {
        alert.success('Artículo creado exitosamente');
        handleClose();
        onSuccess();
      } else {
        alert.error(result.error || 'Error al crear artículo');
      }
    } catch (err) {
      alert.error('Error interno del servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = Object.values(ArticleCategory).map((category, index) => ({
    id: index,
    label: category,
  }));

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Crear Artículo"
      maxWidth="md"
    >
      <div className="space-y-6">
        <TextField
          label="Título"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          required
          placeholder="Título del artículo"
        />

        <TextField
          label="Subtítulo"
          value={formData.subtitle}
          onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
          placeholder="Subtítulo opcional"
        />

        <TextField
          label="Texto del artículo"
          value={formData.text}
          onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))}
          type="textarea"
          rows={6}
          required
          placeholder="Contenido del artículo..."
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Categoría
          </label>
          <Select
            value={Object.values(ArticleCategory).indexOf(formData.category)}
            onChange={(id) => {
              const categories = Object.values(ArticleCategory);
              setFormData((prev) => ({
                ...prev,
                category: categories[id as number] as ArticleCategory,
              }));
            }}
            options={categoryOptions}
            placeholder="Selecciona una categoría"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Imagen del artículo (opcional)
          </label>
          <MultimediaUploader
            uploadPath="/public/web/articles"
            onChange={handleImageChange}
            accept="image/*"
            maxFiles={1}
            maxSize={5}
            variant="banner"
            aspectRatio="16:9"
            buttonType="icon"
          />
          {newImageFile.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              ✓ Imagen seleccionada: {newImageFile[0].name}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outlined" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando...' : 'Crear Artículo'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default CreateArticleDialog;
