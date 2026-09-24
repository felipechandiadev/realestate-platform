'use client';

import React, { useState } from 'react';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import { Button } from '@/shared/components/ui/Button/Button';
import Select from '@/shared/components/ui/Select/Select';
import Alert from '@/shared/components/ui/Alert/Alert';
import { useSubmitContact } from '@/features/portal/contact/hooks';
import { CreateContactSchema } from '@/features/portal/contact/validation';
import type { CreateContactInput, ContactSubject } from '@/features/portal/contact/types';

interface ContactFormProps {
  className?: string;
  onSuccess?: () => void;
}

/**
 * ContactForm component
 * 
 * Contact form for users to reach out to the company.
 * Includes fields for name, email, phone, subject, and message.
 * Features Zod validation, success/error handling, and mutation hooks.
 * 
 * @param {string} className - Additional CSS classes
 * @param {Function} onSuccess - Callback executed on successful submission
 */
export default function ContactForm({
  className = '',
  onSuccess,
}: ContactFormProps) {
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState<CreateContactInput>({
    fullName: '',
    email: '',
    phone: '',
    subject: 'general_inquiry',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitContactMutation = useSubmitContact();

  const subjectOptions = [
    { id: 'general_inquiry', label: 'Consulta General' },
    { id: 'property_inquiry', label: 'Consulta sobre Propiedad' },
    { id: 'partnership', label: 'Alianza Comercial' },
    { id: 'complaint', label: 'Reclamo' },
    { id: 'other', label: 'Otro' },
  ];

  const handleChange = (field: keyof CreateContactInput) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      subject: 'general_inquiry',
      message: '',
    });
    setErrors({});
    setSubmitStatus(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);
    setErrors({});
    setIsSubmitting(true);

    try {
      // Validate with Zod
      const validated = CreateContactSchema.safeParse(formData);
      
      if (!validated.success) {
        const fieldErrors: Record<string, string> = {};
        validated.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        setIsSubmitting(false);
        return;
      }

      await submitContactMutation.mutateAsync(validated.data);
      
      setSubmitStatus({
        type: 'success',
        message: '¡Mensaje enviado exitosamente! Le responderemos pronto.',
      });
      
      handleReset();
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Hubo un error al enviar el mensaje. Por favor, intente nuevamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`contact-form space-y-6 ${className}`}
    >
      {submitStatus && (
        <Alert variant={submitStatus.type === 'success' ? 'success' : 'error'}>
          {submitStatus.message}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField
          label="Nombre Completo"
          placeholder="Ingrese su nombre completo"
          value={formData.fullName}
          onChange={handleChange('fullName')}
          required
        />
        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}

        <TextField
          label="Correo Electrónico"
          type="email"
          placeholder="correo@ejemplo.com"
          value={formData.email}
          onChange={handleChange('email')}
          required
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField
          label="Teléfono"
          type="tel"
          placeholder="+56 9 1234 5678"
          value={formData.phone || ''}
          onChange={handleChange('phone')}
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}

        <Select
          label="Asunto"
          options={subjectOptions}
          value={formData.subject}
          onChange={(id) => {
            if (id) {
              setFormData({ ...formData, subject: id as ContactSubject });
              if (errors.subject) {
                setErrors({ ...errors, subject: '' });
              }
            }
          }}
          required
        />
        {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
      </div>

      <TextField
        label="Mensaje"
        multiline
        rows={6}
        placeholder="Escriba su mensaje aquí..."
        value={formData.message}
        onChange={handleChange('message')}
        required
      />
      {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outlined"
          onClick={handleReset}
          disabled={isSubmitting}
        >
          Limpiar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
        </Button>
      </div>
    </form>
  );
}
