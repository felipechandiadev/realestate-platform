'use client';

import { useEffect, useRef, useState } from 'react';

import { env } from '@/lib/env';
import { Button } from '@/shared/components/ui/Button/Button';

interface ContractPaymentsSectionProps {
  payments: any[] | undefined;
  updating: boolean;
  onUpdatePaymentStatus: (
    payment: any,
    index: number,
    newStatus: 'PENDING' | 'PAID' | 'CANCELLED',
  ) => void;
  onAttachDocument: (payment: any) => void;
  onAddPayment: () => void;
  canAddPayment?: boolean;
  currency?: 'CLP' | 'UF';
  getPaymentTypeLabel: (type: string) => string;
  getPaymentStatusLabel: (status: string) => string;
  getPaymentStatusColor: (status: string) => string;
}

const statusIcons: Record<string, string> = {
  PENDING: 'schedule',
  PENDING_VERIFICATION: 'fact_check',
  PAID: 'check_circle',
  CANCELLED: 'cancel',
};

const documentStatusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  UPLOADED: 'Subido',
  RECIBIDO: 'Recibido',
  REJECTED: 'Rechazado',
};

const getDocumentStatusLabel = (status?: string): string => {
  if (!status) {
    return 'Sin estado';
  }

  return documentStatusLabels[status] ?? status;
};

const parseDate = (value: unknown): Date | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const parsed = new Date(value as string);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDisplayDate = (
  value: unknown,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
): string => {
  const date = parseDate(value);
  if (!date) {
    return 'Sin fecha definida';
  }

  return date.toLocaleDateString('es-CL', options);
};

const resolveDocumentUrl = (document: any): string | null => {
  if (!document) {
    return null;
  }

  const candidate: unknown =
    (typeof document.url === 'string' && document.url) ||
    (typeof document.fileUrl === 'string' && document.fileUrl) ||
    (document.multimedia?.url as string | undefined);

  if (!candidate || typeof candidate !== 'string') {
    return null;
  }

  if (/^https?:\/\//i.test(candidate)) {
    return candidate;
  }

  const normalizedPath = candidate.startsWith('/') ? candidate : `/${candidate}`;
  return `${env.backendApiUrl}${normalizedPath}`;
};

const getDocumentLabel = (document: any, index: number): string => {
  if (typeof document?.title === 'string' && document.title.trim().length > 0) {
    return document.title.trim();
  }

  if (
    typeof document?.documentType?.name === 'string' &&
    document.documentType.name.trim().length > 0
  ) {
    return document.documentType.name.trim();
  }

  return `Documento ${index + 1}`;
};

const getPaymentKey = (payment: any, index: number): string => {
  if (typeof payment?.id === 'string' && payment.id.length > 0) {
    return `id:${payment.id}`;
  }

  if (typeof payment?.__clientId === 'string' && payment.__clientId.length > 0) {
    return `client:${payment.__clientId}`;
  }

  return `index:${index}`;
};

export default function ContractPaymentsSection({
  payments,
  updating,
  onUpdatePaymentStatus,
  onAttachDocument,
  onAddPayment,
  canAddPayment = true,
  currency = 'CLP',
  getPaymentTypeLabel,
  getPaymentStatusLabel,
  getPaymentStatusColor,
}: ContractPaymentsSectionProps) {
  const formatAmount = (amount: number | string) => {
    const numeric = typeof amount === 'string' ? parseFloat(amount) : Number(amount);

    if (Number.isNaN(numeric)) {
      return amount;
    }

    const formatterOptions =
      currency === 'UF'
        ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        : { minimumFractionDigits: 0, maximumFractionDigits: 0 };

    return numeric.toLocaleString('es-CL', formatterOptions);
  };

  const [optimisticPaidAt, setOptimisticPaidAt] = useState<Record<string, string>>({});
  const previousStatusRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!Array.isArray(payments)) {
      previousStatusRef.current = new Map();
      setOptimisticPaidAt({});
      return;
    }

    const previousStatuses = previousStatusRef.current;
    const nextStatuses = new Map<string, string>();
    const visibleKeys = new Set<string>();

    setOptimisticPaidAt((current) => {
      const draft = { ...current };
      let changed = false;

      payments.forEach((payment, index) => {
        const key = getPaymentKey(payment, index);
        visibleKeys.add(key);

        const currentStatus = payment?.status as string | undefined;
        if (currentStatus) {
          nextStatuses.set(key, currentStatus);
        }

        const previousStatus = previousStatuses.get(key);
        const hasServerPaidAt = Boolean(payment?.paidAt);

        if (currentStatus === 'PAID') {
          if (hasServerPaidAt) {
            if (draft[key]) {
              delete draft[key];
              changed = true;
            }
          } else if (previousStatus && previousStatus !== 'PAID' && !draft[key]) {
            draft[key] = new Date().toISOString();
            changed = true;
          }
        } else if (draft[key]) {
          delete draft[key];
          changed = true;
        }
      });

      Object.keys(draft).forEach((key) => {
        if (!visibleKeys.has(key)) {
          delete draft[key];
          changed = true;
        }
      });

      previousStatusRef.current = nextStatuses;
      return changed ? draft : current;
    });
  }, [payments]);

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Pagos Programados</h3>
          <p className="text-sm text-muted-foreground">Gestiona los pagos asociados al contrato</p>
        </div>
        <Button
          variant="containedPrimary"
          size="sm"
          onClick={() => {
            if (canAddPayment) {
              onAddPayment();
            }
          }}
          disabled={updating || !canAddPayment}
        >
          <span className="material-symbols-outlined text-sm mr-2">add</span>
          Agregar Pago
        </Button>
      </div>

      {(!payments || payments.length === 0) && (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
          <span className="material-symbols-outlined text-4xl mb-2 block">payment</span>
          <p>No hay pagos programados</p>
          {canAddPayment && (
            <p className="text-xs mt-2">Usa el botón "Agregar Pago" para programar un nuevo cobro.</p>
          )}
        </div>
      )}

      {payments && payments.length > 0 && (
        <div className="space-y-3">
          {payments.map((payment: any, index: number) => {
            const paymentKey = getPaymentKey(payment, index);
            const resolvedPaidAt = payment?.paidAt ?? optimisticPaidAt[paymentKey];
            const isPaid = payment?.status === 'PAID';
            const isCancelled = payment?.status === 'CANCELLED';
            const hasRevenueInfo = typeof payment?.isAgencyRevenue === 'boolean';
            const isAgencyRevenue = payment?.isAgencyRevenue === true;

            return (
              <div
                key={payment.id || payment.__clientId || index}
                className="p-4 bg-card border border-border rounded-lg"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-base text-primary bg-primary/10 rounded-full p-2">payments</span>
                      <div className="space-y-1">
                        <h4 className="text-base font-semibold text-foreground">
                          {getPaymentTypeLabel(payment.type)}
                        </h4>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-12 gap-y-6 text-sm">
                      <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Estado actual</span>
                        <div
                          className={`flex items-center gap-x-2 gap-y-1 px-3 py-1.5 flex-wrap rounded-lg border text-xs font-semibold w-fit ${getPaymentStatusColor(payment.status)}`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {statusIcons[payment.status] || 'info'}
                          </span>
                          {getPaymentStatusLabel(payment.status)}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fecha de pago</span>
                        <div className="flex items-center gap-x-2 gap-y-1 flex-wrap text-sm text-foreground">
                          <span className="material-symbols-outlined text-sm text-muted-foreground">event</span>
                          <span className="font-medium">{formatDisplayDate(payment.date)}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fecha de recepción</span>
                        <div className="flex items-center gap-x-2 gap-y-1 flex-wrap text-sm text-foreground">
                          <span className="material-symbols-outlined text-sm text-muted-foreground">event_available</span>
                          <span className="font-medium">{resolvedPaidAt ? formatDisplayDate(resolvedPaidAt) : 'Aún sin registro'}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Ingreso</span>
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          {hasRevenueInfo ? (
                            <div className="flex items-center gap-2">
                              <span
                                className={`material-symbols-outlined text-base ${
                                  isAgencyRevenue ? 'text-green-600' : 'text-red-500'
                                }`}
                                aria-label={isAgencyRevenue ? 'Pago para la empresa' : 'Pago externo'}
                              >
                                {isAgencyRevenue ? 'check_circle' : 'close'}
                              </span>
                              <span className="text-xs font-medium">
                                {isAgencyRevenue ? 'Empresa' : 'Externo'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Sin información</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Monto</p>
                    <p className="text-lg font-bold text-foreground">
                      {currency} {formatAmount(payment.amount ?? 0)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-border pt-3 space-y-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Descripción</span>
                    <p className="text-sm text-foreground">
                      {payment.description?.trim()?.length ? payment.description : 'Sin descripción registrada'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">description</span>
                      Comprobante adjunto
                      {Array.isArray(payment.documents) && payment.documents.length > 0 && (
                        <span className="text-xs font-semibold text-foreground">
                          ({payment.documents.length})
                        </span>
                      )}
                    </span>

                    {Array.isArray(payment.documents) && payment.documents.length > 0 ? (
                      <div className="mt-2 flex flex-col gap-2">
                        {payment.documents.map((document: any, documentIndex: number) => {
                          const documentUrl = resolveDocumentUrl(document);
                          const createdAtLabel = document?.createdAt
                            ? formatDisplayDate(document.createdAt, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : null;

                          return (
                            <div
                              key={document.id || document.documentId || documentIndex}
                              className="flex items-start gap-3 rounded-md border border-border px-3 py-2"
                            >
                              <span className="material-symbols-outlined text-base text-primary mt-0.5">description</span>
                              <div className="flex-1 space-y-1">
                                <span className="text-sm font-medium text-foreground">
                                  {getDocumentLabel(document, documentIndex)}
                                </span>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  {document?.documentType?.name && (
                                    <span className="px-2 py-0.5 rounded-full border border-border uppercase tracking-wide">
                                      {document.documentType.name}
                                    </span>
                                  )}
                                  {document?.status && (
                                    <span className="px-2 py-0.5 rounded-full bg-foreground/5 text-foreground">
                                      {getDocumentStatusLabel(document.status)}
                                    </span>
                                  )}
                                  {createdAtLabel && <span>{createdAtLabel}</span>}
                                </div>
                              </div>
                              <Button
                                variant="text"
                                size="sm"
                                className="text-blue-600 hover:bg-blue-50"
                                onClick={() => {
                                  if (documentUrl) {
                                    window.open(documentUrl, '_blank', 'noopener,noreferrer');
                                  }
                                }}
                                disabled={!documentUrl}
                              >
                                <span className="material-symbols-outlined text-sm mr-1">visibility</span>
                                Ver
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">No hay comprobantes adjuntos.</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      {(!isPaid && !isCancelled) && (
                        <Button
                          variant="text"
                          size="sm"
                          onClick={() => onUpdatePaymentStatus(payment, index, 'PAID')}
                          disabled={updating}
                          className="text-green-600 hover:bg-green-50"
                        >
                          <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
                          Marcar Pagado
                        </Button>
                      )}
                      {!isPaid && payment?.status !== 'CANCELLED' && (
                        <Button
                          variant="text"
                          size="sm"
                          onClick={() => onUpdatePaymentStatus(payment, index, 'CANCELLED')}
                          disabled={updating}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <span className="material-symbols-outlined text-sm mr-1">cancel</span>
                          Cancelar
                        </Button>
                      )}
                      {(!isPaid && payment?.status !== 'CANCELLED') && (
                        <div className="border-l border-border mx-2" />
                      )}
                      <Button
                        variant="text"
                        size="sm"
                        onClick={() => onAttachDocument(payment)}
                        disabled={updating || !payment.id}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <span className="material-symbols-outlined text-sm mr-1">attach_file</span>
                        Adjuntar Comprobante
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
