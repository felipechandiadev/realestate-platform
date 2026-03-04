'use client';

import IconButton from '@/shared/components/ui/IconButton/IconButton';

interface ContractFinancialSectionProps {
  contract: any;
  onEditFinancial?: () => void;
  editDisabled?: boolean;
  editLoading?: boolean;
}

export default function ContractFinancialSection({
  contract,
  onEditFinancial,
  editDisabled = false,
  editLoading = false,
}: ContractFinancialSectionProps) {
  const amountLabel = typeof contract?.currency === 'string' ? contract.currency : 'CLP';
  const totalAmount = typeof contract?.amount === 'number' ? contract.amount : null;
  const commissionAmount = typeof contract?.commissionAmount === 'number' ? contract.commissionAmount : null;
  const commissionPercent = typeof contract?.commissionPercent === 'number' ? contract.commissionPercent : null;
  const formattedCommissionPercent = commissionPercent !== null ? Number(commissionPercent.toFixed(2)) : null;

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Resumen financiero</h3>
          <p className="text-sm text-muted-foreground">
            Revisa y actualiza los montos principales del contrato.
          </p>
        </div>
        {onEditFinancial && (
          <IconButton
            icon="edit"
            variant="text"
            size="sm"
            ariaLabel="Editar montos del contrato"
            onClick={onEditFinancial}
            disabled={editDisabled}
            isLoading={editLoading}
            className="text-primary hover:bg-primary/10"
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Monto Total
          </label>
          <p className="text-2xl font-bold text-foreground">
            {amountLabel}{' '}
            {totalAmount !== null ? totalAmount.toLocaleString('es-CL') : '—'}
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Comisión ({formattedCommissionPercent !== null ? formattedCommissionPercent : '—'}%)
          </label>
          <p className="text-2xl font-bold text-green-600">
            CLP {commissionAmount !== null ? commissionAmount.toLocaleString('es-CL') : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
