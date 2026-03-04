'use server';

import { env } from '@/lib/env';

/**
 * Verify user email using token from email link
 */
export async function verifyEmailAction(token: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`${env.backendApiUrl}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Error al verificar correo',
      };
    }

    return {
      success: true,
      message: data.message || 'Correo verificado exitosamente',
    };
  } catch (error) {
    console.error('Verify email error:', error);
    return {
      success: false,
      error: 'Error de conexión. Intenta de nuevo.',
    };
  }
}

/**
 * Resend verification email to user
 */
export async function resendVerificationEmailAction(email: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${env.backendApiUrl}/auth/resend-verification-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || 'Error al reenviar correo',
      };
    }

    return {
      success: true,
      message:
        data.message ||
        'Correo de verificación reenviado. Revisa tu bandeja.',
    };
  } catch (error) {
    console.error('Resend verification email error:', error);
    return {
      success: false,
      error: 'Error de conexión. Intenta de nuevo.',
    };
  }
}
