import { apiClient } from "@/lib/api/client";
import type { AuditLog, AuditSearchFilters, AuditPaginatedResponse } from "../types";

const BASE_URL = "/audit-logs";

export async function listAuditLogs(filters: AuditSearchFilters = {}): Promise<AuditPaginatedResponse> {
  const params = new URLSearchParams();
  if (filters.action) params.append("action", filters.action);
  if (filters.entity) params.append("entity", filters.entity);
  if (filters.entityId) params.append("entityId", filters.entityId);
  if (filters.userId) params.append("userId", filters.userId);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.offset) params.append("offset", filters.offset.toString());

  const response = await apiClient.get<AuditPaginatedResponse>(
    `${BASE_URL}?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${await getAuthToken()}`,
      },
    }
  );
  return response.data;
}

export async function getAuditLog(auditId: string): Promise<AuditLog> {
  const response = await apiClient.get<AuditLog>(`${BASE_URL}/${auditId}`, {
    headers: {
      Authorization: `Bearer ${await getAuthToken()}`,
    },
  });
  return response.data;
}

export async function searchAuditLogs(
  entity: string,
  entityId: string,
  limit: number = 50,
  offset: number = 0
): Promise<AuditPaginatedResponse> {
  const params = new URLSearchParams({
    entity,
    entityId,
    limit: limit.toString(),
    offset: offset.toString(),
  });

  const response = await apiClient.get<AuditPaginatedResponse>(
    `${BASE_URL}/search?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${await getAuthToken()}`,
      },
    }
  );
  return response.data;
}

async function getAuthToken(): Promise<string> {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    throw new Error("Authentication token not found");
  }
  return token;
}