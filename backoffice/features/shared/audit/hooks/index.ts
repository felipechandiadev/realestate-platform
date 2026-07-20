import { useQuery, UseQueryResult } from "@tanstack/react-query";
import * as AuditService from "../services";
import type { AuditLog, AuditSearchFilters, AuditPaginatedResponse } from "../types";

export function useAuditLogs(
  filters: AuditSearchFilters = {}
): UseQueryResult<AuditPaginatedResponse, Error> {
  return useQuery({
    queryKey: ["auditLogs", filters],
    queryFn: () => AuditService.listAuditLogs(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAuditLog(auditId: string | null | undefined): UseQueryResult<AuditLog, Error> {
  return useQuery({
    queryKey: ["auditLogs", "detail", auditId],
    queryFn: () => AuditService.getAuditLog(auditId!),
    enabled: Boolean(auditId),
  });
}

export function useSearchAuditLogs(
  entity: string,
  entityId: string,
  limit?: number,
  offset?: number
): UseQueryResult<AuditPaginatedResponse, Error> {
  return useQuery({
    queryKey: ["auditLogs", "search", entity, entityId, limit, offset],
    queryFn: () => AuditService.searchAuditLogs(entity, entityId, limit, offset),
    enabled: Boolean(entity && entityId),
    staleTime: 1000 * 60,
  });
}