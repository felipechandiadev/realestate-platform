'use client';

import { useCallback, useEffect, useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField';
import { useUpdateContractFinancials } from '@/features/backoffice/contracts/hooks';
import { ContractFinancialsSchema } from '@/features/backoffice/contracts/validation';
import type { Contract } from '@/features/backoffice/contracts/types';

interface EditFinancialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: Contract | null;
  onSuccess?: () => void;
}

/**
 * Edit Contract Financials Dialog Component
 *
 * Dialog form for editing financial details (price, fees, currency) of a contract
 * Uses dedicated mutation hook
 *
 * @param {EditFinancialsDialogProps} props - Component props
 * @returns {React.ReactNode} Dialog component
 */
export function EditFinancialsDialog({
  open,
  onOpenChange,
  contract,
  onSuccess,
}: EditFinancialsDialogProps) {
  const [formData, setFormData] = useState<{
    price?: number;
    currency?: string;
    commissionPercentage?: number;
  }>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const { mutate: updateFinancials, isPending } = useUpdateContractFinancials(contract?.id || '');

  // Pre-populate form when contract changes
  useEffect(() => {
    if (contract) {
      setFormData({
        price: contract.price,
        currency: contract.currency || 'MXN',
        commissionPercentage: contract.commissionPercentage,
      });
      setErrors({});
    }
  }, [contract, open]);

  const handleInputChange = useCallback(
    (field: string, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
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
      const result = ContractFinancialsSchema.safeParse(formData);
      if (!result.success) {
        setErrors(result.error.flatten().fieldErrors);
        return;
      }

      // Call API
      updateFinancials(
        { id: contract.id, data: result.data },
        {
          onSuccess: () => {
            setFormData({});
            setErrors({});
            onOpenChange(false);
            onSuccess?.();
          },
          onError: (error) => {
            console.error('Error updating financials:', error);
            setErrors({
              submit: [
                error instanceof Error
                  ? error.message
                  : 'Error al actualizar montos',
              ],
            });
          },
        }
      );
    },
    [contract?.id, formData, updateFinancials, onOpenChange, onSuccess]
  );

  if (!contract) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Montos"
      description="Actualizar información financiera del contrato"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Price */}
        <TextField
          label="Monto*"
          type="number"
          step="0.01"
          value={formData.price || ''}
          onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
          placeholder="0.00"
          error={errors.price?.[0]}
        />

        {/* Currency */}
        <TextField
          label="Moneda*"
          value={formData.currency || 'MXN'}
          onChange={(e) => handleInputChange('currency', e.target.value)}
          placeholder="MXN"
          maxLength={3}
          error={errors.currency?.[0]}
        />

        {/* Commission Percentage */}
        <TextField
          label="Porcentaje de Comisión (%)"
          type="number"
          step="0.01"
          value={formData.commissionPercentage || ''}
          onChange={(e) =>
            handleInputChange('commissionPercentage', parseFloat(e.target.value))
          }
          placeholder="0.00"
          error={errors.commissionPercentage?.[0]}
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
            Guardar
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
