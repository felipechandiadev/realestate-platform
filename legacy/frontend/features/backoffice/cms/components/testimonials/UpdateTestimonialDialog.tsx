'use client';

import { useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { UpdateBaseForm, type BaseUpdateFormField } from '@/shared/components/ui/BaseForm';
import { updateTestimonial, type Testimonial } from '@/features/backoffice/cms/actions/testimonials.action';
import { useAlert } from '@/providers/AlertContext';

export interface UpdateTestimonialDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  testimonial: Testimonial | null;
}

export function UpdateTestimonialDialog({
  open,
  onClose,
  onSuccess,
  testimonial,
}: UpdateTestimonialDialogProps) {
  const alert = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formFields: BaseUpdateFormField[] = [
    {
      name: 'name',
      label: 'Nombre del cliente',
      type: 'text',
      required: true,
    },
    {
      name: 'position',
      label: 'Posición/Cargo',
      type: 'text',
    },
    {
      name: 'content',
      label: 'Contenido del testimonio',
      type: 'textarea',
      required: true,
      rows: 6,
    },
    {
      name: 'imageUrl',
      label: 'Foto de perfil',
      type: 'image',
      variant: 'avatar',
      currentUrl: testimonial?.imageUrl,
      currentType: 'image',
      acceptedTypes: ['image/*'],
      maxSize: 5,
      aspectRatio: '1:1',
      buttonText: 'Cambiar foto',
      labelText: 'Foto de perfil',
      previewSize: 'md',
    },
  ];

  const initialState = testimonial
    ? {
        name: testimonial.name || '',
        position: testimonial.position || '',
        content: testimonial.content || '',
        imageUrl: testimonial.imageUrl || '',
      }
    : {
        name: '',
        position: '',
        content: '',
        imageUrl: '',
      };

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!testimonial) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', String(values.name || ''));
      formDataToSend.append('position', String(values.position || ''));
      formDataToSend.append('content', String(values.content || ''));

      // Si hay un archivo de imagen nuevo (from MultimediaUpdater)
      if (values.imageUrlFile instanceof File) {
        formDataToSend.append('image', values.imageUrlFile);
      }

      const result = await updateTestimonial(testimonial.id, formDataToSend);

      if (result.success) {
        alert.success('Testimonio actualizado exitosamente');
        onClose();
        onSuccess();
      } else {
        alert.error(result.error || 'Error al actualizar testimonio');
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
      title="Editar Testimonio"
      maxWidth="md"
    >
      {testimonial ? (
        <UpdateBaseForm
          fields={formFields}
          initialState={initialState}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Actualizar Testimonio"
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
}
