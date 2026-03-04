/**
 * Reset Password Page (Portal - Auth Flow)
 * 
 * Propósito:
 * - Página de restablecimiento de contraseña con token
 * - Permitir definir nueva contraseña usando enlace temporal
 * - Validación de token de recuperación
 * 
 * Funcionalidad:
 * - Server component con validación de token en backend
 * - searchParams con token de recuperación
 * - Valida token antes de renderizar formulario
 * - ResetPasswordForm (client component) para submit
 * - Estados: token inválido, token expirado, éxito
 * - Redirect a login después de cambio exitoso
 * 
 * Audiencia: Usuarios con enlace de recuperación válido
 */

import type { Metadata } from "next";
import Link from "next/link";
import ResetPasswordForm from "./ResetPasswordForm";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Restablecer contraseña | Portal",
  description: "Define una nueva contraseña usando tu enlace temporal de recuperación.",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

async function validatePasswordResetToken(token: string) {
  try {
    const response = await fetch(`${env.backendApiUrl}/auth/password-recovery/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      return {
        valid: false,
        error:
          error?.message ||
          "El enlace de recuperación no es válido o ha expirado.",
      };
    }

    const data = await response.json();
    return { valid: true, data };
  } catch (error) {
    console.error("Error validating password reset token", error);
    return {
      valid: false,
      error: "No fue posible validar el enlace de recuperación.",
    };
  }
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params?.token;

  if (!token) {
    return (
      <section className="min-h-screen bg-background px-4 py-16 flex flex-col items-center">
        <div className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-sm p-8 space-y-6 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Enlace inválido</h1>
          <p className="text-sm text-muted-foreground">
            El enlace para restablecer contraseña es inválido o falta el token necesario. Solicita uno nuevo desde el portal.
          </p>
          <Link
            href="/portal/forgot-password"
            className="text-primary hover:underline"
            data-test-id="portal-reset-password-request-new"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </section>
    );
  }

  const validation = await validatePasswordResetToken(token);

  if (!validation.valid || !validation.data) {
    return (
      <section className="min-h-screen bg-background px-4 py-16 flex flex-col items-center">
        <div className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-sm p-8 space-y-6 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Enlace expirado</h1>
          <p className="text-sm text-muted-foreground">
            {validation.error || "El enlace de recuperación ha caducado. Solicita uno nuevo para continuar."}
          </p>
          <Link
            href="/portal/forgot-password"
            className="text-primary hover:underline"
            data-test-id="portal-reset-password-request-again"
          >
            Obtener un nuevo enlace
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background px-4 py-16 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-sm p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Crea tu nueva contraseña</h1>
          <p className="text-sm text-muted-foreground">
            Por seguridad este enlace tiene una vigencia limitada. Completa el formulario para restablecer tu acceso.
          </p>
        </div>

        <ResetPasswordForm
          token={token}
          emailHint={validation.data.emailHint}
        />

        <div className="text-center text-sm text-muted-foreground">
          ¿Necesitas ayuda? Escríbenos a&nbsp;
          <a href="mailto:soporte@realestate.cl" className="text-primary hover:underline">
            soporte@realestate.cl
          </a>
        </div>
      </div>
    </section>
  );
}
