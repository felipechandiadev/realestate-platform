'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog } from "@realestate/ui";
import { TextField } from '@realestate/ui';
import { Button } from '@realestate/ui';
import { useAlert } from '@/shared/hooks/useAlert';

interface ContractEditFinancialDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: {
    amount: number;
    commissionPercent: number;
    commissionAmount?: number;
    tenantCommissionPercent?: number;
    tenantCommissionAmount?: number;
    landlordCommissionPercent?: number;
    landlordCommissionAmount?: number;
  }) => Promise<void>;
  loading?: boolean;
  currency?: 'CLP' | 'UF';
  ufValue?: number | null;
  defaultAmount?: number | null;
  defaultCommissionPercent?: number | null;
  monthlyRent?: number | null;
  defaultTenantCommissionPercent?: number | null;
  defaultLandlordCommissionPercent?: number | null;
  saleSplit?: boolean;
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
  monthlyRent = null,
  defaultTenantCommissionPercent = null,
  defaultLandlordCommissionPercent = null,
  saleSplit = false,
}: ContractEditFinancialDialogProps) {
  const { showAlert } = useAlert();
  const [amountValue, setAmountValue] = useState('');
  const [percentValue, setPercentValue] = useState('');
  const [tenantPercentValue, setTenantPercentValue] = useState('');
  const [landlordPercentValue, setLandlordPercentValue] = useState('');
  const splitCommission = saleSplit || (typeof monthlyRent === 'number' && monthlyRent > 0);
  const buyerLabel = saleSplit ? 'Comprador' : 'Arrendatario';
  const sellerLabel = saleSplit ? 'Vendedor' : 'Arrendador';

  useEffect(() => {
    if (open) {
      setAmountValue(formatNumberInput(defaultAmount));
      setPercentValue(formatNumberInput(defaultCommissionPercent));
      setTenantPercentValue(formatNumberInput(defaultTenantCommissionPercent));
      setLandlordPercentValue(formatNumberInput(defaultLandlordCommissionPercent));
    }
  }, [open, defaultAmount, defaultCommissionPercent, defaultTenantCommissionPercent, defaultLandlordCommissionPercent]);

  const amountNumber = useMemo(() => Number.parseFloat(amountValue), [amountValue]);
  const percentNumber = useMemo(() => Number.parseFloat(percentValue), [percentValue]);

  const tenantPercentNumber = useMemo(() => Number.parseFloat(tenantPercentValue), [tenantPercentValue]);
  const landlordPercentNumber = useMemo(() => Number.parseFloat(landlordPercentValue), [landlordPercentValue]);

  const monthlyBaseClp = useMemo(() => {
    if (!splitCommission) return null;
    if (saleSplit) {
      if (!Number.isFinite(amountNumber) || amountNumber <= 0) return null;
      if (currency === 'UF') {
        const numericUf = typeof ufValue === 'number' ? ufValue : 0;
        if (numericUf <= 0) return null;
        return amountNumber * numericUf;
      }
      return amountNumber;
    }
    if (monthlyRent == null) return null;
    if (currency === 'UF') {
      const numericUf = typeof ufValue === 'number' ? ufValue : 0;
      if (numericUf <= 0) return null;
      return monthlyRent * numericUf;
    }
    return monthlyRent;
  }, [splitCommission, saleSplit, amountNumber, monthlyRent, currency, ufValue]);

  const sideAmount = (percent: number) => {
    if (monthlyBaseClp == null || !Number.isFinite(percent) || percent < 0) return null;
    return Math.round(monthlyBaseClp * (percent / 100));
  };

  const tenantAmountPreview = sideAmount(tenantPercentNumber);
  const landlordAmountPreview = sideAmount(landlordPercentNumber);

  const commissionAmountPreview = useMemo(() => {
    if (splitCommission) {
      if (tenantAmountPreview == null || landlordAmountPreview == null) return null;
      return tenantAmountPreview + landlordAmountPreview;
    }

    if (Number.isNaN(amountNumber) || Number.isNaN(percentNumber) || percentNumber < 0) {
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
  }, [
    splitCommission,
    tenantAmountPreview,
    landlordAmountPreview,
    amountNumber,
    percentNumber,
    currency,
    ufValue,
  ]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      showAlert({ message: 'Ingresa un monto válido mayor a 0', type: 'warning', duration: 3000 });
      return;
    }

    if (currency === 'UF') {
      const numericUf = typeof ufValue === 'number' ? ufValue : 0;
      if (numericUf <= 0) {
        showAlert({ message: 'No es posible calcular la comisión sin el valor de la UF', type: 'warning', duration: 4000 });
        return;
      }
    }

    if (splitCommission) {
      if (!Number.isFinite(tenantPercentNumber) || tenantPercentNumber < 0 || !Number.isFinite(landlordPercentNumber) || landlordPercentNumber < 0) {
        showAlert({ message: `Ingresa los porcentajes de comisión del ${buyerLabel.toLowerCase()} y del ${sellerLabel.toLowerCase()}`, type: 'warning', duration: 3000 });
        return;
      }
      if (tenantAmountPreview == null || landlordAmountPreview == null) return;
      await onSubmit({
        amount: amountNumber,
        commissionPercent: tenantPercentNumber + landlordPercentNumber,
        commissionAmount: tenantAmountPreview + landlordAmountPreview,
        tenantCommissionPercent: tenantPercentNumber,
        tenantCommissionAmount: tenantAmountPreview,
        landlordCommissionPercent: landlordPercentNumber,
        landlordCommissionAmount: landlordAmountPreview,
      });
      return;
    }

    if (Number.isNaN(percentNumber) || percentNumber <= 0) {
      showAlert({ message: 'Ingresa un porcentaje de comisión válido', type: 'warning', duration: 3000 });
      return;
    }

    if (commissionAmountPreview == null) {
      showAlert({ message: 'No es posible calcular el monto de comisión', type: 'warning', duration: 3000 });
      return;
    }
    await onSubmit({
      amount: amountNumber,
      commissionPercent: percentNumber,
      commissionAmount: commissionAmountPreview,
    });
  };

  const previewCommissionClp = useMemo(() => {
    if (commissionAmountPreview === null) {
      return '—';
    }
    return `$ ${formatCurrency(commissionAmountPreview)}`;
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
          label={`Monto total (${currency === 'UF' ? 'UF' : '$'})`}
          type="number"
          value={amountValue}
          onChange={(event) => setAmountValue(event.target.value)}
          placeholder="Ej: 150000000"
          required
          disabled={loading}
          min="0"
          step="0.01"
        />

        {splitCommission ? (
          <>
            <p className="text-xs text-muted-foreground">
              {saleSplit
                ? `Base: precio de venta (${formatCurrency(amountNumber || 0)} ${currency === 'UF' ? 'UF' : '$'}).`
                : `Base: un mes de arriendo (${formatCurrency(monthlyRent ?? 0)} ${currency === 'UF' ? 'UF' : '$'}).`}
            </p>
            <TextField
              label={`Comisión ${buyerLabel.toLowerCase()} (%)`}
              type="number"
              value={tenantPercentValue}
              onChange={(event) => setTenantPercentValue(event.target.value)}
              required
              disabled={loading}
              min="0"
              step="0.1"
            />
            <TextField
              label={`Comisión ${sellerLabel.toLowerCase()} (%)`}
              type="number"
              value={landlordPercentValue}
              onChange={(event) => setLandlordPercentValue(event.target.value)}
              required
              disabled={loading}
              min="0"
              step="0.1"
            />
          </>
        ) : (
          <>
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
          </>
        )}

        {currency === 'UF' && (
          <p className="text-xs text-muted-foreground">
            Se utilizará el valor de la UF actual ({ufValue ?? '—'}) para recalcular la comisión.
          </p>
        )}

        <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
          {splitCommission ? (
            <div className="space-y-1">
              <p>{buyerLabel}: <span className="font-semibold text-foreground">{tenantAmountPreview == null ? '—' : `$ ${formatCurrency(tenantAmountPreview)}`}</span></p>
              <p>{sellerLabel}: <span className="font-semibold text-foreground">{landlordAmountPreview == null ? '—' : `$ ${formatCurrency(landlordAmountPreview)}`}</span></p>
              <p>Total empresa: <span className="font-semibold text-foreground">{previewCommissionClp}</span></p>
            </div>
          ) : (
            <p>
              Comisión aproximada: <span className="font-semibold text-foreground">{previewCommissionClp}</span>
            </p>
          )}
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
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
