'use client';

import { useCallback, useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField';
import { Select } from '@/shared/components/ui/Select';
import { useCreateContract } from '@/features/backoffice/contracts/hooks';
import { ContractSchema } from '@/features/backoffice/contracts/validation';
import type { CreateContractInput } from '@/features/backoffice/contracts/types';

interface CreateContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  propertyId?: string;
}

/**
 * Create Contract Dialog Component
 *
 * Dialog form for creating a new contract
 * Includes field validation via Zod schema
 * Uses React Query mutation for API call
 *
 * @param {CreateContractDialogProps} props - Component props
 * @returns {React.ReactNode} Dialog component
 */
export function CreateContractDialog({
  open,
  onOpenChange,
  onSuccess,
  propertyId: defaultPropertyId,
}: CreateContractDialogProps) {
  const [formData, setFormData] = useState<Partial<CreateContractInput>>({
    propertyId: defaultPropertyId || '',
    partyName: '',
    contractType: 'LEASE',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const { mutate: createContract, isPending } = useCreateContract();

  const handleInputChange = useCallback(
    (field: string, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form data
      const result = ContractSchema.safeParse(formData);
      if (!result.success) {
        setErrors(result.error.flatten().fieldErrors);
        return;
      }

      // Call API
      createContract(result.data, {
        onSuccess: () => {
          setFormData({
            propertyId: defaultPropertyId || '',
            partyName: '',
            contractType: 'LEASE',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            notes: '',
          });
          setErrors({});
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error) => {
          console.error('Error creating contract:', error);
          setErrors({
            submit: [
              error instanceof Error
                ? error.message
                : 'Error al crear el contrato',
            ],
          });
        },
      });
    },
    [formData, createContract, onOpenChange, onSuccess, defaultPropertyId]
  );

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Crear Nuevo Contrato"
      description="Complete los datos del nuevo contrato"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property ID */}
        <TextField
          label="ID de Propiedad*"
          value={formData.propertyId || ''}
          onChange={(e) => handleInputChange('propertyId', e.target.value)}
          placeholder="Ej: prop-12345"
          error={errors.propertyId?.[0]}
          disabled={!!defaultPropertyId}
        />

        {/* Party Name */}
        <TextField
          label="Contraparte*"
          value={formData.partyName || ''}
          onChange={(e) => handleInputChange('partyName', e.target.value)}
          placeholder="Nombre de la otra parte"
          error={errors.partyName?.[0]}
        />

        {/* Contract Type */}
        <Select
          label="Tipo de Contrato*"
          value={formData.contractType || 'LEASE'}
          onChange={(value) => handleInputChange('contractType', value)}
          options={[
            { label: 'Arrendamiento', value: 'LEASE' },
            { label: 'Venta', value: 'SALE' },
            { label: 'Comodato', value: 'LOAN' },
            { label: 'Otra', value: 'OTHER' },
          ]}
          error={errors.contractType?.[0]}
        />

        {/* Start Date */}
        <TextField
          label="Fecha Inicio*"
          type="date"
          value={formData.startDate || ''}
          onChange={(e) => handleInputChange('startDate', e.target.value)}
          error={errors.startDate?.[0]}
        />

        {/* End Date */}
        <TextField
          label="Fecha Fin*"
          type="date"
          value={formData.endDate || ''}
          onChange={(e) => handleInputChange('endDate', e.target.value)}
          error={errors.endDate?.[0]}
        />

        {/* Notes */}
        <TextField
          label="Notas"
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Notas adicionales"
          multiline
          rows={3}
          error={errors.notes?.[0]}
        />

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700 text-sm">{errors.submit[0]}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button variant="primary" type="submit" loading={isPending}>
            Crear Contrato
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
