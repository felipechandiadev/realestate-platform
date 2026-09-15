'use client';

import { Button } from '@realestate/ui';
import { IconButton } from '@realestate/ui';
import {
  FileText,
  MailCheck,
  XCircle,
  User,
  RefreshCw,
  Calendar,
  Paperclip,
  Eye,
  type LucideIcon,
} from 'lucide-react';
import { env } from '@/lib/env';

interface ContractDocumentCardProps {
  document: any;
  onAttachDocument?: (document: any) => void;
  onDeleteRequest?: (document: any) => void;
  deleteDisabled?: boolean;
  deleteLoading?: boolean;
  onToggleRequired?: (document: any) => void;
  toggleRequiredDisabled?: boolean;
  toggleRequiredLoading?: boolean;
}

export const statusThemes: Record<
  string,
  { label: string; Icon: LucideIcon | null; tone: string }
> = {
  PENDING: {
    label: 'Pendiente',
    Icon: null,
    tone: 'bg-amber-100 text-amber-800 border border-amber-200',
  },
  UPLOADED: {
    label: 'Subido',
    Icon: null,
    tone: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  },
  RECIBIDO: {
    label: 'Recibido',
    Icon: MailCheck,
    tone: 'bg-blue-100 text-blue-800 border border-blue-200',
  },
  REJECTED: {
    label: 'Rechazado',
    Icon: XCircle,
    tone: 'bg-rose-100 text-rose-700 border border-rose-200',
  },
};

export const requiredChipClass =
  'px-3 py-1 rounded-full border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold';
export const optionalChipClass =
  'px-3 py-1 rounded-full border border-border bg-background text-muted-foreground text-xs font-semibold';

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

export const formatDisplayDate = (
  value: unknown,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
): string | null => {
  const date = parseDate(value);
  if (!date) {
    return null;
  }

  return date.toLocaleDateString('es-CL', options);
};

export const resolveDocumentUrl = (document: any): string | null => {
  if (!document) {
    return null;
  }

  const candidate: unknown =
    (typeof document.url === 'string' && document.url) ||
    (typeof document.fileUrl === 'string' && document.fileUrl) ||
    (typeof document.multimediaUrl === 'string' && document.multimediaUrl) ||
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

export const resolveStatusBadge = (document: any) => {
  if (document?.status && statusThemes[document.status]) {
    return statusThemes[document.status];
  }

  if (document?.uploaded) {
    return statusThemes.UPLOADED;
  }

  return statusThemes.PENDING;
};

export const resolveDocumentId = (document: any): string | null => {
  if (!document) {
    return null;
  }

  if (typeof document.documentId === 'string' && document.documentId.trim().length > 0) {
    return document.documentId.trim();
  }

  if (typeof document.id === 'string' && document.id.trim().length > 0) {
    return document.id.trim();
  }

  return null;
};

export const getDocumentTypeName = (document: any): string => {
  if (typeof document?.documentTypeName === 'string' && document.documentTypeName.trim().length > 0) {
    return document.documentTypeName.trim();
  }

  if (
    typeof document?.documentType?.name === 'string' &&
    document.documentType.name.trim().length > 0
  ) {
    return document.documentType.name.trim();
  }

  return 'Documento asociado';
};

const ContractDocumentCard: React.FC<ContractDocumentCardProps> = ({
  document,
  onAttachDocument,
  onDeleteRequest,
  deleteDisabled = false,
  deleteLoading = false,
  onToggleRequired,
  toggleRequiredDisabled = false,
  toggleRequiredLoading = false,
}) => {
  const status = resolveStatusBadge(document);
  const StatusIcon = status.Icon;
  const createdAtLabel = formatDisplayDate(document?.createdAt, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const updatedAtLabel = formatDisplayDate(document?.updatedAt, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const documentUrl = resolveDocumentUrl(document);
  const hasFile = Boolean(documentUrl);
  const contractCode =
    typeof document?.contractCode === 'string' && document.contractCode.trim().length > 0
      ? document.contractCode.trim()
      : typeof document?.contract?.code === 'string'
      ? document.contract.code
      : null;
  const personLabel =
    (typeof document?.personName === 'string' && document.personName) ||
    (typeof document?.person?.name === 'string' && document.person.name) ||
    null;
  const documentTitle =
    typeof document?.title === 'string' && document.title.trim().length > 0
      ? document.title.trim()
      : 'Sin título definido';

  return (
    <div className="p-4 bg-card border border-border rounded-lg">
      <div className="flex items-start gap-4 mb-3">
        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-3">
            <span className="inline-flex rounded-full bg-primary/10 p-2 text-primary">
              <FileText className="size-4" aria-hidden />
            </span>
            <div className="space-y-2">
              <div className="flex w-full items-center gap-2">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <h4 className="text-base font-semibold text-foreground">
                    {getDocumentTypeName(document)}
                  </h4>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${status.tone}`}
                  >
                    {StatusIcon ? <StatusIcon className="mr-1 size-3.5" aria-hidden /> : null}
                    {status.label}
                  </span>
                  {onToggleRequired ? (
                    <button
                      type="button"
                      className={`inline-flex items-center gap-1 ${
                        document?.required ? requiredChipClass : optionalChipClass
                      } ${toggleRequiredDisabled ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-sm'}`}
                      onClick={() => {
                        if (toggleRequiredDisabled || toggleRequiredLoading) return;
                        onToggleRequired(document);
                      }}
                      disabled={toggleRequiredDisabled || toggleRequiredLoading}
                      aria-busy={toggleRequiredLoading}
                      title={document?.required ? 'Marcar como opcional' : 'Marcar como requerido'}
                    >
                      {toggleRequiredLoading ? (
                        <RefreshCw className="size-3 animate-spin" aria-hidden />
                      ) : null}
                      {document?.required ? 'Requerido' : 'Opcional'}
                    </button>
                  ) : (
                    document?.required && <span className={requiredChipClass}>Requerido</span>
                  )}
                  {contractCode && (
                    <span className="px-3 py-1 rounded-full border border-border text-xs text-muted-foreground">
                      Contrato {contractCode}
                    </span>
                  )}
                </div>
                {onDeleteRequest && (
                  <IconButton
                    icon="delete"
                    variant="text"
                    size="xs"
                    className="ml-auto text-red-500 hover:bg-red-50"
                    ariaLabel="Eliminar documento"
                    onClick={() => onDeleteRequest(document)}
                    disabled={deleteDisabled}
                    isLoading={deleteLoading}
                  />
                )}
              </div>

              <p className="text-sm text-muted-foreground">{documentTitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Persona asociada
              </span>
              <span className="inline-flex items-center gap-1 text-foreground">
                <User className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                {personLabel || 'Sin persona asignada'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Última actualización
              </span>
              <span className="inline-flex items-center gap-1 text-foreground">
                <RefreshCw className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                {updatedAtLabel || 'Sin registro'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Creado
              </span>
              <span className="inline-flex items-center gap-1 text-foreground">
                <Calendar className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                {createdAtLabel || 'Sin registro'}
              </span>
            </div>
          </div>

          {document?.notes && document.notes.trim().length > 0 && (
            <div className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground">
              {document.notes}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-3 space-y-3">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
            <Paperclip className="size-4 shrink-0" aria-hidden />
            Archivo
          </span>

          {hasFile ? (
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3 rounded-md border border-border px-3 py-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground line-clamp-2">
                    {document?.multimedia?.seoTitle ||
                      document?.multimedia?.title ||
                      document?.title ||
                      'Documento adjunto'}
                  </p>
                  <p className="text-xs text-muted-foreground">Disponible para descarga segura</p>
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
                >
                  <Eye className="mr-1 size-3.5" aria-hidden />
                  Ver
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No hay archivos adjuntos.</p>
          )}
        </div>

        {typeof onAttachDocument === 'function' && (
          <div>
            <Button
              variant="text"
              size="sm"
              className="text-blue-600 hover:bg-blue-50"
              onClick={() => onAttachDocument(document)}
            >
              <Paperclip className="mr-1 size-3.5" aria-hidden />
              {hasFile ? 'Actualizar' : 'Adjuntar'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractDocumentCard;
