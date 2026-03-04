'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';

// ===================================
// Audit Types and Interfaces
// ===================================

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  statusCode: number;
  success: boolean;
  duration: number;
  ipAddress?: string;
  userAgent?: string;
  requestData?: any;
  responseData?: any;
  errorMessage?: string;
  timestamp: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: 'ADMIN' | 'AGENT';
  };
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  resource?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  success?: boolean;
  statusCode?: number;
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
}

export interface AuditLogParams extends AuditLogFilters {
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
  sortField?: string;
}

// ===================================
// Audit Server Actions
// ===================================

/**
 * List audit logs with filters and pagination
 */
export async function listAuditLogs(params: AuditLogParams = {}): Promise<{
  success: boolean;
  data?: {
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const searchParams = new URLSearchParams();
    
    // Filters
    if (params.userId) searchParams.set('userId', params.userId);
    if (params.action) searchParams.set('action', params.action);
    if (params.resource) searchParams.set('resource', params.resource);
    if (params.method) searchParams.set('method', params.method);
    if (typeof params.success === 'boolean') searchParams.set('success', params.success.toString());
    if (params.statusCode) searchParams.set('statusCode', params.statusCode.toString());
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);
    if (params.ipAddress) searchParams.set('ipAddress', params.ipAddress);
    
    // Search and pagination
    if (params.search) searchParams.set('search', params.search);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.sortField) searchParams.set('sortField', params.sortField);

    const url = `${env.backendApiUrl}/audit-logs?${searchParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Failed to fetch audit logs: ${response.status}` 
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error listing audit logs:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get a specific audit log by ID
 */
export async function getAuditLog(id: string): Promise<{
  success: boolean;
  data?: AuditLog;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/audit-logs/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Failed to fetch audit log: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(userId: string, params: {
  page?: number;
  limit?: number;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
} = {}): Promise<{
  success: boolean;
  data?: {
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.action) searchParams.set('action', params.action);
    if (params.resource) searchParams.set('resource', params.resource);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);

    const url = `${env.backendApiUrl}/audit-logs/user/${userId}?${searchParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Failed to fetch user audit logs: ${response.status}` 
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching user audit logs:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(resource: string, resourceId?: string, params: {
  page?: number;
  limit?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
} = {}): Promise<{
  success: boolean;
  data?: {
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const searchParams = new URLSearchParams();
    searchParams.set('resource', resource);
    if (resourceId) searchParams.set('resourceId', resourceId);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.action) searchParams.set('action', params.action);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);

    const url = `${env.backendApiUrl}/audit-logs/resource?${searchParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Failed to fetch resource audit logs: ${response.status}` 
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching resource audit logs:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get audit statistics
 */
export async function getAuditStatistics(params: {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
} = {}): Promise<{
  success: boolean;
  data?: {
    totalLogs: number;
    successfulActions: number;
    failedActions: number;
    uniqueUsers: number;
    topActions: Array<{ action: string; count: number }>;
    topResources: Array<{ resource: string; count: number }>;
    activityByTime?: Array<{ period: string; count: number }>;
  };
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const searchParams = new URLSearchParams();
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);
    if (params.groupBy) searchParams.set('groupBy', params.groupBy);

    const url = `${env.backendApiUrl}/audit-logs/statistics?${searchParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Failed to fetch audit statistics: ${response.status}` 
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching audit statistics:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Export audit logs to CSV/Excel
 */
export async function exportAuditLogs(params: AuditLogFilters & {
  format?: 'csv' | 'excel';
  startDate?: string;
  endDate?: string;
} = {}): Promise<{
  success: boolean;
  data?: { downloadUrl: string; filename: string };
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const searchParams = new URLSearchParams();
    
    // Filters
    if (params.userId) searchParams.set('userId', params.userId);
    if (params.action) searchParams.set('action', params.action);
    if (params.resource) searchParams.set('resource', params.resource);
    if (params.method) searchParams.set('method', params.method);
    if (typeof params.success === 'boolean') searchParams.set('success', params.success.toString());
    if (params.statusCode) searchParams.set('statusCode', params.statusCode.toString());
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);
    if (params.ipAddress) searchParams.set('ipAddress', params.ipAddress);
    if (params.format) searchParams.set('format', params.format);

    const url = `${env.backendApiUrl}/audit-logs/export?${searchParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Failed to export audit logs: ${response.status}` 
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Delete old audit logs (cleanup)
 */
export async function cleanupAuditLogs(params: {
  olderThan: string; // ISO date string
  dryRun?: boolean;
}): Promise<{
  success: boolean;
  data?: { deletedCount: number; preview?: number };
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/audit-logs/cleanup`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Failed to cleanup audit logs: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error cleaning up audit logs:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}