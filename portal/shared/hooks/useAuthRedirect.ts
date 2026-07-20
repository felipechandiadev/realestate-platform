'use client';

import { useRouter } from 'next/navigation';

export function useAuthRedirect() {
  const router = useRouter();

  const handleAuthError = (error: string) => {
    // Detectar errores de autenticación comunes
    const authErrorPatterns = [
      'No autorizado',
      'Unauthorized',
      'Token expired',
      'Invalid token',
      'Authentication required',
      'Session expired',
      'No authenticated'
    ];

    const isAuthError = authErrorPatterns.some(pattern =>
      error.toLowerCase().includes(pattern.toLowerCase())
    );

    if (isAuthError) {
      // Redirigir a la ruta principal
      router.push('/');
      return true; // Indica que fue un error de auth
    }

    return false; // No fue error de auth
  };

  return { handleAuthError };
}