'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button, Dialog, TextField } from '@realestate/ui';
import { useAlert } from '@/shared/hooks/useAlert';
import { submitContactForm } from '@/features/shared/notifications/actions/notifications.action';

interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
}

const FORM_ID = 'portal-contact-form';

const ContactDialog: React.FC<ContactDialogProps> = ({ open, onClose }) => {
  const { showAlert } = useAlert();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setNombre('');
    setEmail('');
    setTelefono('');
    setMensaje('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!nombre.trim() || !email.trim() || !telefono.trim() || !mensaje.trim()) {
      showAlert({
        message: 'Por favor completa todos los campos',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const result = await submitContactForm({
        name: nombre.trim(),
        email: email.trim(),
        phone: telefono.trim(),
        message: mensaje.trim(),
      });

      if (!result.success) {
        throw new Error(result.error || 'Error al enviar el mensaje');
      }

      showAlert({
        message: 'Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.',
        type: 'success',
        duration: 5000,
      });

      resetForm();
      setTimeout(() => {
        onClose();
      }, 500);
    } catch {
      showAlert({
        message: 'Error al enviar el mensaje. Por favor intenta nuevamente.',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Contacto"
      size="sm"
      scroll="paper"
      actionsJustify="between"
      data-test-id="portal-contact-dialog"
      actions={
        <>
          <Button
            type="button"
            variant="outlined"
            size="md"
            onClick={handleClose}
            disabled={loading}
            data-test-id="portal-contact-cancel"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            variant="primary"
            size="md"
            disabled={loading}
            loading={loading}
            data-test-id="portal-contact-submit"
            className="inline-flex items-center gap-2"
          >
            {!loading ? <Send size={16} aria-hidden /> : null}
            {loading ? 'Enviando...' : 'Enviar'}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="space-y-4"
      >
        <TextField
          label="Nombre"
          name="contact-nombre"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          disabled={loading}
          required
        />

        <TextField
          label="Correo Electrónico"
          name="contact-email"
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />

        <TextField
          label="Teléfono"
          name="contact-telefono"
          type="tel"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          disabled={loading}
          required
        />

        <TextField
          label="Mensaje"
          name="contact-mensaje"
          placeholder="Mensaje"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={4}
          disabled={loading}
          required
        />
      </form>
    </Dialog>
  );
};

export default ContactDialog;
