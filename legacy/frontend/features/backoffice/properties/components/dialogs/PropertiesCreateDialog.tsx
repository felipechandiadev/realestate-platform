/**
 * @fileoverview Dialog for creating new properties
 *
 * Client component that provides a form to create new properties
 * Uses useCreateProperty mutation hook for API calls
 */

'use client';

import React, { useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { useCreateProperty } from '@/features/backoffice/properties/hooks';
import { PropertySchema } from '@/features/backoffice/properties/validation';
import type { CreatePropertyDto, Operation } from '@/features/backoffice/properties/types';

interface PropertiesCreateDialogProps {
  operation: Operation;
  onSuccess?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Dialog component for creating new properties
 */
export function PropertiesCreateDialog({
  operation,
  onSuccess,
  isOpen: controlledOpen,
  onOpenChange,
}: PropertiesCreateDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (controlledOpen !== undefined) {
      onOpenChange?.(value);
    } else {
      setInternalOpen(value);
    }
  };
  const [formData, setFormData] = useState<Partial<CreatePropertyDto>>({
    operation,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: createProperty, isPending } = useCreateProperty();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const result = PropertySchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(
        Object.entries(fieldErrors).reduce(
          (acc, [key, msgs]) => ({
            ...acc,
            [key]: msgs?.[0] || 'Error de validación',
          }),
          {}
        )
      );
      return;
    }

    // Submit
    createProperty(result.data, {
      onSuccess: () => {
        setOpen(false);
        setFormData({ operation });
        setErrors({});
        onSuccess?.();
      },
      onError: (error) => {
        setErrors({
          submit: error.message || 'Error al crear propiedad',
        });
      },
    });
  };

  return (
    <>
      {/* Only show button if not controlled from parent */}
      {controlledOpen === undefined && (
        <Button
          onClick={() => setOpen(true)}
          variant="primary"
          disabled={isPending}
        >
          + Nueva Propiedad
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen} title="Crear Propiedad">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Título
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={`mt-1 block w-full px-3 py-2 border rounded-md ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isPending}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={`mt-1 block w-full px-3 py-2 border rounded-md ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              disabled={isPending}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Precio
              </label>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                className={`mt-1 block w-full px-3 py-2 border rounded-md ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isPending}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tipo
              </label>
              <input
                type="text"
                value={formData.type || ''}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                placeholder="ej: apartment, house"
                className={`mt-1 block w-full px-3 py-2 border rounded-md ${
                  errors.type ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isPending}
              />
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
              )}
            </div>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6">
            <Button
              onClick={() => setOpen(false)}
              variant="secondary"
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isPending}
              loading={isPending}
            >
              Crear Propiedad
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

export default PropertiesCreateDialog;
