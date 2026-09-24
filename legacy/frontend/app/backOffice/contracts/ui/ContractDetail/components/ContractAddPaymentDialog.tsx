'use client';

import { useEffect, useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import Select from '@/shared/components/ui/Select/Select';
import { Button } from '@/shared/components/ui/Button/Button';
import Switch from '@/shared/components/ui/Switch/Switch';
import { PaymentType } from '@/shared/types/contracts';
import { useAlert } from '@/shared/hooks/useAlert';

interface PaymentTypeOption {
  id: PaymentType;
  label: string;
}

interface ContractAddPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; date: string; type: PaymentType; description?: string; isAgencyRevenue: boolean }) => Promise<void>;
  loading: boolean;
  currency?: 'CLP' | 'UF';
  paymentTypeOptions: PaymentTypeOption[];
}

export default function ContractAddPaymentDialog({
  open,
  onClose,
  onSubmit,
  loading,
  currency = 'CLP',
  paymentTypeOptions,
}: ContractAddPaymentDialogProps) {
  const { showAlert } = useAlert();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<PaymentType | ''>('');
  const [description, setDescription] = useState('');
  const [isAgencyRevenue, setIsAgencyRevenue] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setType(paymentTypeOptions[0]?.id ?? PaymentType.OTHER);
      setDescription('');
      setIsAgencyRevenue(false);
    }
  }, [open, paymentTypeOptions]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const parsedAmount = parseFloat(amount);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      showAlert({ message: 'El monto debe ser mayor a 0', type: 'warning', duration: 3000 });
      return;
    }

    if (!date) {
      showAlert({ message: 'Debes seleccionar una fecha', type: 'warning', duration: 3000 });
      return;
    }

    if (!type) {
      showAlert({ message: 'Selecciona un tipo de pago', type: 'warning', duration: 3000 });
      return;
    }

    await onSubmit({
      amount: parsedAmount,
      date,
      type,
      description: description.trim() || undefined,
      isAgencyRevenue,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!loading) {
          onClose();
        }
      }}
      title="Agregar Pago"
      size="sm"
      showCloseButton
      className="relative"
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-1">
        <TextField
          label={`Monto (${currency})`}
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Ej: 1500000"
          required
          disabled={loading}
        />

        <TextField
          label="Fecha de Pago"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
          disabled={loading}
        />

        <Select
          label="Tipo de Pago"
          options={paymentTypeOptions}
          value={type}
          onChange={(id) => setType((id as PaymentType) ?? PaymentType.OTHER)}
          placeholder="Selecciona tipo de pago"
          disabled={loading || paymentTypeOptions.length === 0}
        />

        <TextField
          label="Descripción (opcional)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Ej: Segundo pago programado"
          rows={3}
          disabled={loading}
        />

        <div className="flex items-center rounded-lg border border-border px-3 py-2">
          <Switch
            label="Ingreso para la empresa"
            labelPosition="right"
            checked={isAgencyRevenue}
            onChange={setIsAgencyRevenue}
          />
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
            disabled={loading || paymentTypeOptions.length === 0}
          >
            {loading ? 'Guardando...' : 'Guardar Pago'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
