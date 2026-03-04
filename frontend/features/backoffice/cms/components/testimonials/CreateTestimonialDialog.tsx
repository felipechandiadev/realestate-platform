'use client';

import { useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import MultimediaUploader from '@/shared/components/ui/FileUploader/MultimediaUploader';
import RangeSlider from '@/shared/components/ui/RangeSlider/RangeSlider';
import { createTestimonial } from '@/features/backoffice/cms/actions/testimonials.action';
import { useAlert } from '@/providers/AlertContext';

export interface CreateTestimonialDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTestimonialDialog({
  open,
  onClose,
  onSuccess,
}: CreateTestimonialDialogProps) {
  const alert = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    position: '',
    rating: 5,
  });
  const [imageFile, setImageFile] = useState<File[]>([]);

  const resetForm = () => {
    setFormData({
      name: '',
      content: '',
      position: '',
      rating: 5,
    });
    setImageFile([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      alert.error('Nombre y contenido del testimonio son obligatorios');
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('content', formData.content.trim());
      formDataToSend.append('position', formData.position.trim());
      formDataToSend.append('isActive', 'true');

      if (imageFile.length > 0) {
        formDataToSend.append('image', imageFile[0]);
      }

      const result = await createTestimonial(formDataToSend);

      if (result.success) {
        alert.success('Testimonio creado exitosamente');
        handleClose();
        onSuccess();
      } else {
        alert.error(result.error || 'Error al crear testimonio');
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
      onClose={handleClose}
      title="Crear Testimonio"
      maxWidth="md"
    >
      <div className="space-y-6">
        <TextField
          label="Nombre del cliente"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          required
          placeholder="Nombre completo"
        />

        <TextField
          label="Posición/Cargo"
          value={formData.position}
          onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
          placeholder="Ej: Director Ejecutivo"
        />

        <TextField
          label="Contenido del testimonio"
          value={formData.content}
          onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
          type="textarea"
          rows={5}
          required
          placeholder="Escriba el testimonio..."
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Foto de perfil (opcional)
          </label>
          <MultimediaUploader
            uploadPath="/public/web/testimonials"
            onChange={setImageFile}
            accept="image/*"
            maxFiles={1}
            maxSize={5}
            variant="avatar"
            aspectRatio="square"
            buttonType="icon"
          />
          {imageFile.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              ✓ Imagen seleccionada: {imageFile[0].name}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando...' : 'Crear Testimonio'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
