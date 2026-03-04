interface ContractHistoryEntryChange {
  field: string;
  previousValue: unknown;
  newValue: unknown;
}

interface ContractHistoryEntry {
  id?: string;
  timestamp?: string;
  userId?: string | null;
  action?: string;
  changes?: ContractHistoryEntryChange[];
  metadata?: Record<string, unknown> | null;
}

interface ContractHistorySectionProps {
  history?: ContractHistoryEntry[] | null;
  resolveActorName?: (userId: string | null | undefined) => string;
}

const actionLabels: Record<string, string> = {
  CONTRACT_CREATED: 'Contrato creado',
  CONTRACT_UPDATED: 'Contrato actualizado',
  CONTRACT_CLOSED: 'Contrato cerrado',
  CONTRACT_MARKED_FAILED: 'Contrato marcado como fallido',
  CONTRACT_SOFT_DELETED: 'Contrato eliminado (soft delete)',
  CONTRACT_PAYMENT_ADDED: 'Pago agregado',
  CONTRACT_PERSON_ADDED: 'Participante agregado',
  CONTRACT_DOCUMENT_ATTACHED: 'Documento adjuntado',
};

const fieldLabels: Record<string, string> = {
  status: 'Estado',
  endDate: 'Fecha de término',
  amount: 'Monto',
  currency: 'Moneda',
  commissionPercent: 'Porcentaje de comisión',
  commissionAmount: 'Monto de comisión',
  payments: 'Pagos',
  payment: 'Pago',
  people: 'Participantes',
  documents: 'Documentos',
  description: 'Descripción',
  deletedAt: 'Fecha de eliminación',
  contract: 'Detalles iniciales',
  propertyId: 'Propiedad',
  userId: 'Usuario',
};

const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) {
    return 'Fecha desconocida';
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isoDateRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{3})?Z$/;

const isIsoDateString = (value: string) => {
  return isoDateRegex.test(value);
};

const formatPrimitive = (value: string | number | boolean) => {
  if (typeof value === 'number') {
    return value.toLocaleString('es-CL');
  }

  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }

  if (typeof value === 'string' && isIsoDateString(value)) {
    return formatTimestamp(value);
  }

  return value;
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '—';
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(formatPrimitive(value));
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '—';
    }

    return value
      .map((item) => {
        if (item === null || item === undefined) {
          return '—';
        }

        if (typeof item === 'object') {
          return JSON.stringify(item, null, 2);
        }

        return String(formatPrimitive(item as string | number | boolean));
      })
      .join('\n');
  }

  if (value instanceof Date) {
    return formatTimestamp(value.toISOString());
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
};

const getFieldLabel = (field: string) => {
  return fieldLabels[field] || field.replace(/_/g, ' ');
};

const getActionLabel = (action?: string) => {
  if (!action) {
    return 'Evento sin acción';
  }

  return actionLabels[action] || action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
};

export default function ContractHistorySection({ history, resolveActorName }: ContractHistorySectionProps) {
  const sortedHistory = [...(history ?? [])].sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeB - timeA;
  });

  if (!sortedHistory.length) {
    return (
      <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
        <span className="material-symbols-outlined text-4xl mb-2 block">history</span>
        <p>No hay eventos registrados para este contrato.</p>
        <p className="text-xs mt-2 max-w-2xl mx-auto">
          Cada cambio relevante (estado, pagos, participantes, documentos) aparecerá aquí con la fecha y el usuario que lo ejecutó.
        </p>
      </div>
    );
  }

  const resolveActor = (userId: string | null | undefined) => {
    if (!userId) {
      return 'Sistema';
    }

    if (resolveActorName) {
      return resolveActorName(userId);
    }

    if (typeof userId === 'string') {
      const truncated = userId.length > 10 ? `${userId.slice(0, 8)}…` : userId;
      return `Usuario ${truncated}`;
    }

    return 'Usuario desconocido';
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Historial de cambios</h3>
        <p className="text-sm text-muted-foreground">Línea de tiempo con las acciones registradas sobre el contrato.</p>
      </header>

      <div className="relative pl-5">
        <div className="absolute left-2 top-3 bottom-3 w-px bg-border" aria-hidden />

        <div className="space-y-6">
          {sortedHistory.map((entry, index) => (
            <div key={entry.id || `${entry.timestamp}-${index}`} className="relative pl-6">
              <span className="absolute left-0 top-2 flex h-3 w-3 items-center justify-center">
                <span className="h-3 w-3 rounded-full bg-primary border-2 border-background" />
              </span>

              <div className="bg-card border border-border rounded-lg p-4 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-foreground flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-primary bg-primary/10 rounded-full p-1.5">history</span>
                      {getActionLabel(entry.action)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ejecutado por <strong className="text-foreground font-medium">{resolveActor(entry.userId)}</strong>
                    </p>
                  </div>
                  <time className="text-xs font-medium text-muted-foreground">
                    {formatTimestamp(entry.timestamp)}
                  </time>
                </div>

                {entry.changes && entry.changes.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Cambios</p>
                    <div className="space-y-3">
                      {entry.changes.map((change, changeIndex) => {
                        const previous = formatValue(change.previousValue);
                        const next = formatValue(change.newValue);

                        const renderValue = (label: string) => {
                          const isMultiline = label.includes('\n') || label.length > 60;

                          if (isMultiline) {
                            return (
                              <pre className="text-xs font-mono bg-muted/60 text-foreground/80 rounded-md p-3 whitespace-pre-wrap break-words max-h-48 overflow-auto">
                                {label}
                              </pre>
                            );
                          }

                          return <span className="text-sm text-foreground/90 break-words">{label}</span>;
                        };

                        return (
                          <div key={`${change.field}-${changeIndex}`} className="border border-border rounded-lg p-3 bg-muted/30">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                              {getFieldLabel(change.field)}
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Valor anterior</span>
                                {renderValue(previous)}
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Nuevo valor</span>
                                {renderValue(next)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Sin cambios específicos registrados para esta acción.</p>
                )}

                {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-border">
                    <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Contexto</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {Object.entries(entry.metadata).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <p className="text-xs font-medium text-muted-foreground uppercase">{getFieldLabel(key)}</p>
                          <p className="text-foreground/90 break-words whitespace-pre-wrap text-sm">
                            {formatValue(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
