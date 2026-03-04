'use client';

import { useCallback, useEffect, useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField';
import { Select } from '@/shared/components/ui/Select';
import { useUpdateContract } from '@/features/backoffice/contracts/hooks';
import { ContractUpdateSchema } from '@/features/backoffice/contracts/validation';
import type { Contract, UpdateContractInput } from '@/features/backoffice/contracts/types';

interface EditContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: Contract | null;
  onSuccess?: () => void;
}

/**
 * Edit Contract Dialog Component
 *
 * Dialog form for editing an existing contract
 * Pre-populates with current contract data
 * Uses React Query mutation for API call
 *
 * @param {EditContractDialogProps} props - Component props
 * @returns {React.ReactNode} Dialog component
 */
export function EditContractDialog({
  open,
  onOpenChange,
  contract,
  onSuccess,
}: EditContractDialogProps) {
  const [formData, setFormData] = useState<Partial<UpdateContractInput>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const { mutate: updateContract, isPending } = useUpdateContract();

  // Pre-populate form when contract changes
  useEffect(() => {
    if (contract) {
      setFormData({
        partyName: contract.partyName || '',
        contractType: contract.contractType || 'LEASE',
        startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
        endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
        status: contract.status || 'PENDING',
        notes: contract.notes || '',
      });
      setErrors({});
    }
  }, [contract, open]);

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
      if (!contract?.id) return;

      // Validate form data
      const result = ContractUpdateSchema.safeParse(formData);
      if (!result.success) {
        setErrors(result.error.flatten().fieldErrors);
        return;
      }

      // Call API
      updateContract(
        { id: contract.id, data: result.data },
        {
          onSuccess: () => {
            setFormData({});
            setErrors({});
            onOpenChange(false);
            onSuccess?.();
          },
          onError: (error) => {
            console.error('Error updating contract:', error);
            setErrors({
              submit: [
                error instanceof Error
                  ? error.message
                  : 'Error al actualizar el contrato',
              ],
            });
          },
        }
      );
    },
    [contract?.id, formData, updateContract, onOpenChange, onSuccess]
  );

  if (!contract) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Contrato"
      description={`Editando contrato de ${contract.partyName}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Status */}
        <Select
          label="Estado*"
          value={formData.status || 'PENDING'}
          onChange={(value) => handleInputChange('status', value)}
          options={[
            { label: 'Pendiente', value: 'PENDING' },
            { label: 'Activo', value: 'ACTIVE' },
            { label: 'Completado', value: 'COMPLETED' },
            { label: 'Cancelado', value: 'CANCELLED' },
            { label: 'Suspendido', value: 'SUSPENDED' },
          ]}
          error={errors.status?.[0]}
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
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
