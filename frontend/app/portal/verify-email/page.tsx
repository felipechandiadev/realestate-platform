/**
 * Email Verification Page (Portal - Auth Flow)
 * 
 * Propósito:
 * - Verificar email del usuario con token enviado por correo
 * - Activar cuenta después de registro
 * - Confirmar email para habilitar funcionalidades completas
 * 
 * Funcionalidad:
 * - Client component con validación automática al cargar
 * - searchParams con token de verificación
 * - Auto-submit a verifyEmailAction al montar
 * - Estados: verificando, éxito, error, token inválido
 * - Opción de reenviar email si falla
 * - Feedback visual con alerts
 * - Redirect a dashboard después de verificación exitosa
 * 
 * Audiencia: Usuarios recién registrados con email pendiente de verificación
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyEmailAction, resendVerificationEmailAction } from '@/features/shared/auth/actions/emailVerification.action';
import { Button } from '@/shared/components/ui/Button/Button';
import { useAlert } from '@/shared/hooks/useAlert';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showAlert } = useAlert();

  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setIsError(true);
      setErrorMessage('Token de verificación no proporcionado');
      setIsLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        setIsLoading(true);
        const result = await verifyEmailAction(token);

        if (result.success) {
          setIsSuccess(true);
          showAlert({
            message: 'Email verificado exitosamente',
            type: 'success',
            duration: 5000,
          });
        } else {
          setIsError(true);
          setErrorMessage(result.error || 'Error al verificar correo');
          showAlert({
            message: result.error || 'Error al verificar correo',
            type: 'error',
          });
        }
      } catch (error) {
        console.error('Verify email error:', error);
        setIsError(true);
        setErrorMessage('Error inesperado durante la verificación');
        showAlert({
          message: 'Error inesperado durante la verificación',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token, showAlert]);

  const handleResendEmail = async () => {
    if (!email.trim()) {
      showAlert({
        message: 'Por favor ingresa tu correo electrónico',
        type: 'error',
      });
      return;
    }

    setIsResending(true);
    try {
      const result = await resendVerificationEmailAction(email);

      if (result.success) {
        showAlert({
          message: result.message || 'Correo de verificación reenviado',
          type: 'success',
          duration: 5000,
        });
      } else {
        showAlert({
          message: result.error || 'Error al reenviar correo',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Resend email error:', error);
      showAlert({
        message: 'Error inesperado',
        type: 'error',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center gap-6">
            <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Verificando tu correo...
              </h2>
              <p className="text-sm text-muted-foreground">
                Por favor espera mientras verificamos tu dirección de correo electrónico.
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {isSuccess && !isLoading && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
              <span className="material-symbols-outlined text-green-600 text-3xl">
                check_circle
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                ¡Correo Verificado!
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Tu correo electrónico ha sido verificado exitosamente. Ahora puedes iniciar sesión en tu cuenta.
              </p>
            </div>

            <div className="w-full space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push('/portal')}
              >
                Ir al Portal
              </Button>
              <Button
                variant="outlined"
                className="w-full"
                onClick={() => router.push('/portal')}
              >
                Iniciar Sesión
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Se redireccionará automáticamente en unos segundos...
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
              <span className="material-symbols-outlined text-red-600 text-3xl">
                cancel
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Error de Verificación
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {errorMessage}
              </p>
            </div>

            <div className="w-full space-y-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground text-left">
                  Reenviar correo a:
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="px-3 py-2 border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isResending}
                />
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={handleResendEmail}
                disabled={isResending}
              >
                {isResending ? 'Reenviando...' : 'Reenviar Correo'}
              </Button>

              <Button
                variant="outlined"
                className="w-full"
                onClick={() => router.push('/portal')}
              >
                Volver al Portal
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
