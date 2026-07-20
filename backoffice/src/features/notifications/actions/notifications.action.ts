'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';
import { refreshAccessToken } from '@/features/shared/auth/actions/auth.action';

export interface CreateNotificationData {
  senderType: 'USER' | 'SYSTEM' | 'ANONYMOUS';
  senderId?: string;
  senderName: string;
  isSystem: boolean;
  message: string;
  targetUserIds: string[];
  type: 'INTEREST' | 'CONTACT' | 'PAYMENT_RECEIPT' | 'PAYMENT_OVERDUE' | 'PUBLICATION_STATUS_CHANGE' | 'CONTRACT_STATUS_CHANGE' | 'PROPERTY_AGENT_ASSIGNMENT';
  targetMails?: string[];
  multimediaId?: string;
}

export type GridSort = 'asc' | 'desc';

export interface UserGridNotificationsParams {
  fields?: string; // comma-separated list of fields
  sort?: GridSort;
  sortField?: string;
  search?: string;
  filtration?: boolean;
  filters?: string; // e.g. "type-INTEREST,status-SEND"
  pagination?: boolean;
  page?: number;
  limit?: number;
}

export interface UserNotificationGridRow {
  id: string;
  message?: string;
  type?: string;
  status?: string;
  senderName?: string;
  senderType?: string;
  isSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // allow additional fields without strict typing
  [key: string]: any;
}

export type UserGridNotificationsResponse =
  | UserNotificationGridRow[]
  | { data: UserNotificationGridRow[]; total: number; page: number; limit: number; totalPages: number };

export async function createNotification(data: CreateNotificationData): Promise<{ success: boolean; error?: string; notification?: any }> {
  try {
    // Obtener sesión para autenticación
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    const url = `${env.backendApiUrl}/notifications`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { success: false, error: errorData?.message || `HTTP ${response.status}` };
    }

    const notification = await response.json();
    return { success: true, notification };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get user notifications grid with filtering, sorting, and pagination
 */
export async function getUserGridNotifications(
  userId: string,
  params: UserGridNotificationsParams = {}
): Promise<UserGridNotificationsResponse> {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    throw new Error('No hay una sesión activa para consultar notificaciones.');
  }

  const url = new URL(`${env.backendApiUrl}/notifications/user/${userId}/grid`);

  // map boolean flags to 'true'|'false' strings
  const setBoolParam = (key: string, value?: boolean) => {
    if (typeof value === 'boolean') url.searchParams.set(key, value ? 'true' : 'false');
  };

  // attach params
  if (params.fields) url.searchParams.set('fields', params.fields);
  if (params.sort) url.searchParams.set('sort', params.sort);
  if (params.sortField) url.searchParams.set('sortField', params.sortField);
  if (typeof params.search === 'string') url.searchParams.set('search', params.search);
  if (typeof params.filters === 'string') url.searchParams.set('filters', params.filters);
  setBoolParam('filtration', params.filtration);
  setBoolParam('pagination', params.pagination);
  if (typeof params.page === 'number') url.searchParams.set('page', String(params.page));
  if (typeof params.limit === 'number') url.searchParams.set('limit', String(params.limit));

  console.log('[DEBUG] getUserGridNotifications - Final URL sent to backend:', url.toString());

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  console.log('[DEBUG] getUserGridNotifications - Response status:', response.status);

  if (!response.ok) {
    // If unauthorized, try refreshing the token once and retry the request
    if (response.status === 401) {
      console.log('[DEBUG] getUserGridNotifications - Received 401, attempting token refresh');
      try {
        const refresh = await refreshAccessToken();
        if (refresh.success && refresh.data?.access_token) {
          const newToken = refresh.data.access_token;
          console.log('[DEBUG] getUserGridNotifications - Retry with refreshed token');
          const retryResp = await fetch(url.toString(), {
            headers: {
              Authorization: `Bearer ${newToken}`,
              Accept: 'application/json',
            },
            cache: 'no-store',
          });

          console.log('[DEBUG] getUserGridNotifications - Retry response status:', retryResp.status);
          if (retryResp.ok) {
            const result = await retryResp.json();
            console.log('[DEBUG] getUserGridNotifications - Retry success');
            return result as UserGridNotificationsResponse;
          }
          // If retry failed, fall through to error handling below
        } else {
          // Refresh failed: clear session cookie and perform logout so UI redirects to login
          console.log('[DEBUG] getUserGridNotifications - Token refresh failed, performing logout and returning empty notifications');
          try {
            const { logoutAction } = await import('@/features/shared/auth/actions/auth.action');
            await logoutAction();
          } catch (logoutErr) {
            console.error('[DEBUG] getUserGridNotifications - Logout after refresh failure failed:', logoutErr);
          }

          // Return an empty list instead of throwing so the UI gracefully handles the unauthenticated state
          return [];
        }
      } catch (err) {
        console.error('[DEBUG] getUserGridNotifications - Token refresh failed with exception:', err);
        try {
          const { logoutAction } = await import('@/features/shared/auth/actions/auth.action');
          await logoutAction();
        } catch (logoutErr) {
          console.error('[DEBUG] getUserGridNotifications - Logout after refresh exception failed:', logoutErr);
        }

        return [];
      }
    }

    let message = `Error ${response.status} al obtener notificaciones del usuario`;
    try {
      const payload = await response.json();
      console.log('[DEBUG] getUserGridNotifications - Error payload:', payload);
      if (payload?.message) {
        message = payload.message;
      }
    } catch {}
    console.log('[DEBUG] getUserGridNotifications - Handling non-auth error:', message);
    console.log('[DEBUG] getUserGridNotifications - Token was:', accessToken ? `${String(accessToken).substring(0, 100)}...` : 'null');

    // Return empty list so UI doesn't break; errors are logged for further inspection
    return [];
  }

  const result = await response.json();
  console.log('[DEBUG] getUserGridNotifications - Response data length:', Array.isArray(result) ? result.length : 'Not an array');
  return result as UserGridNotificationsResponse;
}

// Server action: export user notifications grid as XLSX (returns base64 + filename)
export async function exportUserGridNotificationsExcel(
  userId: string,
  params: UserGridNotificationsParams = {}
): Promise<{ filename: string; base64: string } | { success: false; error: string }> {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return { success: false, error: 'No hay una sesión activa.' };
  }

  const url = new URL(`${env.backendApiUrl}/notifications/user/${userId}/grid/excel`);
  const setBoolParam = (key: string, value?: boolean) => {
    if (typeof value === 'boolean') url.searchParams.set(key, value ? 'true' : 'false');
  };

  if (params.fields) url.searchParams.set('fields', params.fields);
  if (params.sort) url.searchParams.set('sort', params.sort);
  if (params.sortField) url.searchParams.set('sortField', params.sortField);
  if (typeof params.search === 'string') url.searchParams.set('search', params.search);
  if (typeof params.filters === 'string') url.searchParams.set('filters', params.filters);
  setBoolParam('filtration', params.filtration);
  setBoolParam('pagination', params.pagination);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Try refresh once
      const refresh = await refreshAccessToken();
      if (refresh.success && refresh.data?.access_token) {
        const retryResp = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${refresh.data.access_token}`,
            Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          },
          cache: 'no-store',
        });
        if (!retryResp.ok) return { success: false, error: `HTTP ${retryResp.status}` };
        const arr = await retryResp.arrayBuffer();
        const base64 = Buffer.from(arr).toString('base64');
        const contentDisposition = retryResp.headers.get('content-disposition') || 'notificaciones.xlsx';
        const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);
        const filename = filenameMatch ? filenameMatch[1] : 'notificaciones.xlsx';
        return { filename, base64 };
      }
      return { success: false, error: 'No autorizado' };
    }

    return { success: false, error: `HTTP ${response.status}` };
  }

  const arr = await response.arrayBuffer();
  const base64 = Buffer.from(arr).toString('base64');
  const contentDisposition = response.headers.get('content-disposition') || 'notificaciones.xlsx';
  const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);
  const filename = filenameMatch ? filenameMatch[1] : 'notificaciones.xlsx';
  return { filename, base64 };
}

/**
 * Submit contact form - sends a public contact message to administrators
 */
export async function submitContactForm(data: {
  name: string
  email: string
  phone: string
  message: string
}): Promise<{ success: boolean; error?: string; notification?: any }> {
  try {
    const url = `${env.backendApiUrl}/notifications/public/contact`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { success: false, error: errorData?.message || `HTTP ${response.status}` };
    }

    const notification = await response.json();
    return { success: true, notification };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get all notifications for a specific user
 */
export async function getUserNotifications(userId: string): Promise<{ success: boolean; error?: string; notifications?: any[] }> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return { success: false, error: 'Unauthorized' };
    }

    const url = `${env.backendApiUrl}/notifications/user/${userId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { success: false, error: errorData?.message || `HTTP ${response.status}` };
    }

    const notifications = await response.json();
    return { success: true, notifications };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Mark all unread notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      throw new Error('No hay una sesión activa.');
    }

    const url = `${env.backendApiUrl}/notifications/user/${userId}/read-all`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { success: false, error: errorData?.message || `HTTP ${response.status}` };
    }

    const count = await response.json();
    return { success: true, count };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get the count of unread notifications for a user
 */
export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return 0;
    }

    const url = `${env.backendApiUrl}/notifications/user/${userId}/unread-count`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      next: { revalidate: 0 } // Ensure we don't cache this too long
    });

    if (!response.ok) {
      return 0;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching unread notifications count:', error);
    return 0;
  }
}

/**
 * Update notification status
 */
export async function updateNotificationStatus(notificationId: string, status: 'SEND' | 'OPEN'): Promise<{ success: boolean; error?: string; notification?: any }> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return { success: false, error: 'Unauthorized' };
    }

    const url = `${env.backendApiUrl}/notifications/${notificationId}/status`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { success: false, error: errorData?.message || `HTTP ${response.status}` };
    }

    const notification = await response.json();
    return { success: true, notification };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get notification by ID
 */
export async function getNotificationById(notificationId: string): Promise<{ success: boolean; error?: string; notification?: any }> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return { success: false, error: 'Unauthorized' };
    }

    const url = `${env.backendApiUrl}/notifications/${notificationId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { success: false, error: errorData?.message || `HTTP ${response.status}` };
    }

    const notification = await response.json();
    return { success: true, notification };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return { success: false, error: 'Unauthorized' };
    }

    const url = `${env.backendApiUrl}/notifications/${notificationId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { success: false, error: errorData?.message || `HTTP ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}