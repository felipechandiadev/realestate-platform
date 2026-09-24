import { useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import Switch from '@/shared/components/ui/Switch/Switch';
import MultimediaUploader from '@/shared/components/ui/FileUploader/MultimediaUploader';
import { createTestimonial } from '@/features/backoffice/cms/actions/testimonials.action';

export interface CreateTestimonialDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTestimonialDialog: React.FC<CreateTestimonialDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    position: '',
    isActive: true,
  });
  const [newImageFile, setNewImageFile] = useState<File[]>([]);

  const resetForm = () => {
    setFormData({
      name: '',
      content: '',
      position: '',
      isActive: true,
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
    if (!formData.name.trim() || !formData.content.trim()) {
      alert('Nombre y contenido son obligatorios');
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

      const result = await createTestimonial(formDataToSend);

      if (result.success) {
        alert('Testimonio creado exitosamente');
        handleClose();
        onSuccess();
      } else {
        alert(result.error || 'Error al crear testimonio');
      }
    } catch (err) {
      alert('Error interno del servidor');
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

        {/* Upload de imagen */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Imagen del testigo (opcional)
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
              ✓ Imagen seleccionada: {newImageFile[0].name}
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
            {isSubmitting ? 'Creando...' : 'Crear Testimonio'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default CreateTestimonialDialog;