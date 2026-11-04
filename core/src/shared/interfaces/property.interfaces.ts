import { PostRequestStatus } from '../enums/post-request-status.enum';

export interface PostRequest {
  requestedAt: Date;
  requestedBy: string; // User ID of the requester
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  message?: string;
  notes?: string;
  status: PostRequestStatus;
}

/** Desde dónde se ejecutó un cambio. */
export type HistoryChannel = 'BACKOFFICE' | 'PORTAL' | 'CONTRACT' | 'SYSTEM';

/** Tipo de evento (para titular la tarjeta del historial). */
export type HistoryKind =
  | 'CREATED'
  | 'UPDATED'
  | 'PUBLISHED'
  | 'UNPUBLISHED'
  | 'STATUS_CHANGED'
  | 'MEDIA'
  | 'NOTE'
  | 'DELETED';

export interface HistorySource {
  channel: HistoryChannel;
  /** Pantalla o sección donde se hizo (p. ej. "Ubicación"). */
  section?: string;
  /** Referencia opcional (p. ej. el código del contrato). */
  ref?: string;
}

/**
 * Una entrada del historial de una propiedad. Los campos desde `kind` son opcionales:
 * las entradas anteriores no los tienen y se muestran sin origen.
 */
export interface ChangeHistoryEntry {
  timestamp: Date;
  changedBy: string; // User ID of the person who made the change
  field: string;
  previousValue: any;
  newValue: any;
  kind?: HistoryKind;
  source?: HistorySource;
  /** Las entradas de una misma operación comparten `groupId` y se muestran juntas. */
  groupId?: string;
  /** Moneda del precio en ese momento (solo `price`). */
  unit?: string;
  previousUnit?: string;
  /** Cantidades de una carga de multimedia (permite juntar varias cargas seguidas). */
  meta?: { images?: number; videos?: number };
}

export enum UserType {
  COMMUNITY = 'COMMUNITY',
  ANONYMOUS = 'ANONYMOUS',
}

export interface ViewEntry {
  timestamp: Date;
  userId?: string;
  userType?: UserType; // Added userType field
}

export interface LeadEntry {
  timestamp: Date;
  contactInfo: {
    name?: string;
    email?: string;
    phone?: string;
  };
  message?: string;
  userType?: UserType; // Added userType field
  status?: string; // Added optional status field
}
