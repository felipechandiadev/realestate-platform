import { useState, useEffect } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import Switch from '@/shared/components/ui/Switch/Switch';
import MultimediaUploader from '@/shared/components/ui/FileUploader/MultimediaUploader';
import { updateTestimonial } from '@/features/backoffice/cms/actions/testimonials.action';
import { normalizeMediaUrl } from './utils';
import { useAlert } from '@/providers/AlertContext';

export interface Testimonial {
  id: string;
  name: string;
  content: string;
  position?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTestimonialDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  testimonial: Testimonial | null;
}

const UpdateTestimonialDialog: React.FC<UpdateTestimonialDialogProps> = ({
  open,
  onClose,
  onSuccess,
  testimonial,
}) => {
  const { success, error } = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    position: '',
    isActive: true,
  });
  const [newImageFile, setNewImageFile] = useState<File[]>([]);
  const [currentImage, setCurrentImage] = useState<string>('');

  useEffect(() => {
    if (testimonial && open) {
      setFormData({
        name: testimonial.name || '',
        content: testimonial.content || '',
        position: testimonial.position || '',
        isActive: testimonial.isActive ?? true,
      });
      setCurrentImage(testimonial.imageUrl || '');
      setNewImageFile([]);
    }
  }, [testimonial, open]);

  const resetForm = () => {
    setFormData({
      name: '',
      content: '',
      position: '',
      isActive: true,
    });
    setNewImageFile([]);
    setCurrentImage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleImageChange = (files: File[]) => {
    setNewImageFile(files);
  };

  const handleSubmit = async () => {
    if (!testimonial || !formData.name.trim() || !formData.content.trim()) {
      error('Nombre y contenido son obligatorios');
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('content', formData.content.trim());
      formDataToSend.append('position', formData.position.trim());
      formDataToSend.append('isActive', formData.isActive.toString());

      if (newImageFile.length > 0) {
        formDataToSend.append('image', newImageFile[0]);
      }

      const result = await updateTestimonial(testimonial.id, formDataToSend);

      if (result.success) {
        success('Testimonio actualizado exitosamente');
        handleClose();
        onSuccess();
      } else {
        error(result.error || 'Error al actualizar testimonio');
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
      title="Editar Testimonio"
      maxWidth="md"
    >
      {testimonial ? (
        <div className="space-y-6">
          <TextField
            label="Nombre"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Nombre del cliente"
          />

          <TextField
            label="Cargo/Posición"
            value={formData.position}
            onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
            placeholder="CEO, Gerente, etc. (opcional)"
          />

          <TextField
            label="Contenido del testimonio"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            type="textarea"
            rows={4}
            required
            placeholder="El testimonio del cliente..."
          />

          {/* Imagen actual */}
          {currentImage && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Imagen actual
              </label>
              <img
                src={normalizeMediaUrl(currentImage)}
                alt="Imagen actual"
                className="w-20 h-20 object-cover rounded-lg border"
              />
            </div>
          )}

          {/* Upload de nueva imagen */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Cambiar imagen (opcional)
            </label>
            <MultimediaUploader
              uploadPath="/public/web/testimonials"
              onChange={handleImageChange}
              accept="image/*"
              maxFiles={1}
              maxSize={5}
              aspectRatio="square"
              buttonType="icon"
            />
            {newImageFile.length > 0 && (
              <p className="text-sm text-green-600 mt-2">
                ✓ Nueva imagen seleccionada: {newImageFile[0].name}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={formData.isActive}
              onChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <span className="text-sm font-medium text-foreground">Testimonio activo</span>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              Actualizar Testimonio
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center py-8">
          <div className="text-muted-foreground">Cargando...</div>
        </div>
      )}
    </Dialog>
  );
};

export default UpdateTestimonialDialog;