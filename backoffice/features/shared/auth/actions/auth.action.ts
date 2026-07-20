'use server';

import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';
import type { UserGridNotificationsParams, UserGridNotificationsResponse } from './notifications';

// ===================================
// Auth Types and Interfaces
// ===================================

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  username: string;
  email: string;
  password: string;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'AGENT';
  status: 'ACTIVE' | 'INACTIVE';
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
  };
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
  expires_in: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export type LogoutResult =
  | { success: true }
  | { success: false; error: string };

// ===================================
// Existing Logout Function
// ===================================

export async function logoutAction(accessToken?: string): Promise<LogoutResult> {
  const cookieStore = await cookies();
  const tokenFromCookie = cookieStore.get('access_token')?.value;
  const token = accessToken ?? tokenFromCookie;

  if (!token) {
    return { success: true };
  }

  try {
    await fetch(`${env.backendApiUrl}/auth/sign-out`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });
  } catch (error) {
    console.error('logoutAction backend error', error);
    return {
      success: false,
      error: 'No fue posible cerrar la sesión en el servidor',
    };
  }

  if (tokenFromCookie) {
    (cookieStore as unknown as {
      delete: (name: string, options?: Record<string, unknown>) => void;
    }).delete('access_token', { path: '/' });
  }

  return { success: true };
}

// ===================================
// Additional Auth Server Actions
// ===================================

/**
 * Sign in with email and password
 * Note: This is typically handled by NextAuth, but included for completeness
 */
export async function signIn(credentials: SignInCredentials): Promise<{
  success: boolean;
  data?: AuthResponse;
  error?: string;
}> {
  try {
    const response = await fetch(`${env.backendApiUrl}/auth/sign-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Authentication failed: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error signing in:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Sign up a new user
 */
export async function signUp(data: SignUpData): Promise<{
  success: boolean;
  data?: AuthUser;
  error?: string;
}> {
  try {
    const response = await fetch(`${env.backendApiUrl}/auth/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Sign up failed: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error signing up:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(data: PasswordResetRequest): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${env.backendApiUrl}/auth/password-recovery/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Password reset request failed: ${response.status}` 
      };
    }

    const result = await response.json().catch(() => null);
    return { 
      success: true, 
      message:
        result?.message ||
        'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.',
    };
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(data: PasswordReset): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${env.backendApiUrl}/auth/password-recovery/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: data.token,
        password: data.newPassword,
        confirmPassword: data.confirmPassword ?? data.newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Password reset failed: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, message: result.message || 'Password reset successfully' };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Change current user's password (authenticated)
 */
export async function changeCurrentUserPassword(data: ChangePasswordRequest): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Password change failed: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, message: result.message || 'Password changed successfully' };
  } catch (error) {
    console.error('Error changing password:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<{
  success: boolean;
  data?: AuthUser;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/auth/profile`, {
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
        error: errorData?.message || `Failed to fetch profile: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Update current user profile
 */
export async function updateCurrentUserProfile(data: {
  username?: string;
  email?: string;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
  };
}): Promise<{
  success: boolean;
  data?: AuthUser;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Failed to update profile: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(): Promise<{
  success: boolean;
  data?: { access_token: string; expires_in: number };
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    // Try using session token first
    let tokenToUse = session.accessToken;
    let response = await fetch(`${env.backendApiUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenToUse}`,
        'Content-Type': 'application/json',
      },
    });

    // If session token missing or refresh failed, try cookie token as fallback
    if (!response.ok) {
      try {
        const cookieStore = await cookies();
        const cookieToken = cookieStore.get('access_token')?.value;
        if (cookieToken && cookieToken !== tokenToUse) {
          console.log('[refreshAccessToken] Trying refresh with cookie token');
          response = await fetch(`${env.backendApiUrl}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${cookieToken}`,
              'Content-Type': 'application/json',
            },
          });
        }
      } catch (cookieErr) {
        console.warn('[refreshAccessToken] Could not read cookie token:', cookieErr);
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Token refresh failed: ${response.status}` 
      };
    }

    const result = await response.json();

    // Persist the refreshed token in a cookie so subsequent server actions can use it
    try {
      const cookieStore = await cookies();
      if (result?.access_token) {
        const maxAge = typeof result.expires_in === 'number' && result.expires_in > 0 ? Math.floor(result.expires_in) : 12 * 60 * 60;
        cookieStore.set({
          name: 'access_token',
          value: result.access_token,
          httpOnly: true,
          path: '/',
          maxAge,
          sameSite: 'lax',
        });
      }
    } catch (cookieErr) {
      // Non-fatal: just log
      console.warn('Could not set access_token cookie after refresh:', cookieErr);
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('Error refreshing token:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Validate token
 */
export async function validateToken(token: string): Promise<{
  success: boolean;
  data?: { valid: boolean; user?: AuthUser };
  error?: string;
}> {
  try {
    const response = await fetch(`${env.backendApiUrl}/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Token validation failed: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error validating token:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Register a new COMMUNITY user from portal
 * Sends verification email
 */
export async function registerUserAction(formData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<{
  success: boolean;
  error?: string;
  message?: string;
  userId?: string;
}> {
  try {
    const response = await fetch(`${env.backendApiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error:
          data.message ||
          data.error ||
          'Error al registrar usuario',
      };
    }

    return {
      success: true,
      message:
        data.message ||
        'Registro exitoso. Revisa tu email para verificar tu cuenta.',
      userId: data.userId,
    };
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      error: 'Error de conexión. Intenta de nuevo.',
    };
  }
}

export interface LocalUserGridNotificationsParams {
  read?: boolean;
  type?: string;
  page?: number;
  limit?: number;
}

/**
 * Get user grid notifications
 */
export async function getUserGridNotifications(
  userId: string,
  params: LocalUserGridNotificationsParams = {}
): Promise<UserGridNotificationsResponse> {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    throw new Error('No hay una sesión activa para consultar notificaciones.');
  }

  const url = new URL(`${env.backendApiUrl}/notifications/user-grid`);
  url.searchParams.append('userId', userId);

  // Add optional filters from params
  if (params.read !== undefined) {
    url.searchParams.append('read', String(params.read));
  }
  if (params.type) {
    url.searchParams.append('type', params.type);
  }
  if (params.page) {
    url.searchParams.append('page', String(params.page));
  }
  if (params.limit) {
    url.searchParams.append('limit', String(params.limit));
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

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
            // Refresh failed: clear session cookie and force logout so UI redirects to login
            console.log('[DEBUG] getUserGridNotifications - Token refresh failed, performing logout');
            try {
              // import and call logoutAction dynamically to avoid circular imports at module load
              const { logoutAction } = await import('@/features/shared/auth/actions/auth.action');
              await logoutAction();
            } catch (logoutErr) {
              console.error('[DEBUG] getUserGridNotifications - Logout after refresh failure also failed:', logoutErr);
            }
            throw new Error('Sesión invalida. Por favor, inicia sesión nuevamente.');
          }
        } catch (err) {
          console.error('[DEBUG] getUserGridNotifications - Token refresh failed:', err);
          // If refresh threw, also attempt logout to clear stale cookies
          try {
            const { logoutAction } = await import('@/features/shared/auth/actions/auth.action');
            await logoutAction();
          } catch (logoutErr) {
            console.error('[DEBUG] getUserGridNotifications - Logout after refresh error failed:', logoutErr);
          }
          throw new Error('Sesión invalida. Por favor, inicia sesión nuevamente.');
        }
      }

      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Error al obtener notificaciones');
    }

    const data = await response.json();
    return data as UserGridNotificationsResponse;
  } catch (error) {
    console.error('Error en getUserGridNotifications:', error);
    throw new Error('Error en el servidor. Intenta de nuevo más tarde.');
  }
}
