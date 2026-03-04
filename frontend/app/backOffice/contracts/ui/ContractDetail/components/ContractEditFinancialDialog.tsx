'use client';

import { useEffect, useMemo, useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import { Button } from '@/shared/components/ui/Button/Button';
import { useAlert } from '@/shared/hooks/useAlert';

interface ContractEditFinancialDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { amount: number; commissionPercent: number }) => Promise<void>;
  loading?: boolean;
  currency?: 'CLP' | 'UF';
  ufValue?: number | null;
  defaultAmount?: number | null;
  defaultCommissionPercent?: number | null;
}

const formatNumberInput = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '';
  }
  return value.toString();
};

const formatCurrency = (value: number): string =>
  value.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function ContractEditFinancialDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
  currency = 'CLP',
  ufValue = null,
  defaultAmount = null,
  defaultCommissionPercent = null,
}: ContractEditFinancialDialogProps) {
  const { showAlert } = useAlert();
  const [amountValue, setAmountValue] = useState('');
  const [percentValue, setPercentValue] = useState('');

  useEffect(() => {
    if (open) {
      setAmountValue(formatNumberInput(defaultAmount));
      setPercentValue(formatNumberInput(defaultCommissionPercent));
    }
  }, [open, defaultAmount, defaultCommissionPercent]);

  const amountNumber = useMemo(() => Number.parseFloat(amountValue), [amountValue]);
  const percentNumber = useMemo(() => Number.parseFloat(percentValue), [percentValue]);

  const commissionAmountPreview = useMemo(() => {
    if (Number.isNaN(amountNumber) || Number.isNaN(percentNumber)) {
      return null;
    }

    if (percentNumber < 0) {
      return null;
    }

    const baseAmount = (() => {
      if (currency === 'UF') {
        const numericUf = typeof ufValue === 'number' ? ufValue : 0;
        if (numericUf <= 0) {
          return null;
        }
        return amountNumber * numericUf;
      }
      return amountNumber;
    })();

    if (!baseAmount || baseAmount <= 0) {
      return null;
    }

    return Math.round(baseAmount * (percentNumber / 100));
  }, [amountNumber, percentNumber, currency, ufValue]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      showAlert({ message: 'Ingresa un monto válido mayor a 0', type: 'warning', duration: 3000 });
      return;
    }

    if (Number.isNaN(percentNumber) || percentNumber <= 0) {
      showAlert({ message: 'Ingresa un porcentaje de comisión válido', type: 'warning', duration: 3000 });
      return;
    }

    if (currency === 'UF') {
      const numericUf = typeof ufValue === 'number' ? ufValue : 0;
      if (numericUf <= 0) {
        showAlert({ message: 'No es posible calcular la comisión sin el valor de la UF', type: 'warning', duration: 4000 });
        return;
      }
    }

    await onSubmit({ amount: amountNumber, commissionPercent: percentNumber });
  };

  const previewCommissionClp = useMemo(() => {
    if (commissionAmountPreview === null) {
      return '—';
    }
    return `CLP ${formatCurrency(commissionAmountPreview)}`;
  }, [commissionAmountPreview]);

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!loading) {
          onClose();
        }
      }}
      title="Editar montos del contrato"
      size="sm"
      showCloseButton
      className="relative"
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-1">
        <TextField
          label={`Monto total (${currency === 'UF' ? 'UF' : 'CLP'})`}
          type="number"
          value={amountValue}
          onChange={(event) => setAmountValue(event.target.value)}
          placeholder="Ej: 150000000"
          required
          disabled={loading}
          min="0"
          step="0.01"
        />

        <TextField
          label="Comisión (%)"
          type="number"
          value={percentValue}
          onChange={(event) => setPercentValue(event.target.value)}
          placeholder="Ej: 3.5"
          required
          disabled={loading}
          min="0"
          step="0.01"
        />
        <p className="text-xs text-muted-foreground">La comisión final se recalcula con este porcentaje.</p>

        {currency === 'UF' && (
          <p className="text-xs text-muted-foreground">
            Se utilizará el valor de la UF actual ({ufValue ?? '—'}) para recalcular la comisión.
          </p>
        )}

        <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
          <p>
            Comisión aproximada: <span className="font-semibold text-foreground">{previewCommissionClp}</span>
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <Button
            type="button"
            variant="text"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="containedPrimary"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
