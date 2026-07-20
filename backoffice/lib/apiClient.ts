import { redirect } from 'next/navigation';

/**
 * Realiza una petición fetch con manejo automático de errores 401
 * Si recibe un error Unauthorized, redirige a la raíz
 */
export async function fetchWithAuthCheck(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const response = await fetch(url, options);

  // Si es error 401 (Unauthorized), redirigir a inicio
  if (response.status === 401) {
    console.warn('Sesión expirada o no autorizado. Redirigiendo a inicio...');
    redirect('/');
  }

  return response;
}

/**
 * Wrapper para server actions que detecta errores 401
 * y redirige automáticamente a la raíz
 */
export async function withAuthCheck<T>(
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // Si el error contiene "Unauthorized" o "401"
    if (
      error?.message?.includes('Unauthorized') ||
      error?.message?.includes('401') ||
      error?.status === 401
    ) {
      console.warn('Error de autenticación detectado. Redirigiendo a inicio...');
      redirect('/');
    }
    throw error;
  }
}
