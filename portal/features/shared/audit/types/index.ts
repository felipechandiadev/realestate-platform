export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  READ = "READ",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  EXPORT = "EXPORT",
  IMPORT = "IMPORT",
}

export interface AuditEntry {
  id: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  userId: string;
  userName: string;
  userEmail: string;
  description?: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  userId: string;
  userName: string;
  userEmail: string;
  description?: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  createdAt: string;
}

export interface AuditSearchFilters {
  action?: AuditAction;
  entity?: string;
  entityId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface AuditPaginatedResponse {
  data: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}