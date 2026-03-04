/**
 * Forgot Password Page (Portal - Auth Flow)
 * 
 * Propósito:
 * - Página de recuperación de contraseña
 * - Solicitar enlace seguro de restablecimiento vía email
 * - Flujo de 'password reset' sin autenticación
 * 
 * Funcionalidad:
 * - Server component con metadata SEO
 * - ForgotPasswordForm (client component) para submit
 * - Input de email con validación
 * - Envío de email con token temporal
 * - Link de regreso a login
 * - Estados: enviando, éxito, error
 * 
 * Audiencia: Usuarios que olvidaron su contraseña
 */

import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Recuperar contraseña | Portal",
  description:
    "Solicita un enlace seguro para restablecer tu contraseña en la plataforma portal.",
};

export default function ForgotPasswordPage() {
  return (
    <section className="min-h-screen bg-background px-4 py-16 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-sm p-8 flex flex-col items-center gap-6">
        <div className="space-y-2 text-center max-w-lg">
          <h1 className="text-2xl font-semibold text-foreground">¿Olvidaste tu contraseña?</h1>
          <p className="text-sm text-muted-foreground">
            Ingresa tu correo y, si la cuenta existe, te enviaremos un enlace temporal para que puedas crear una nueva contraseña.
          </p>
        </div>

        <ForgotPasswordForm />

        <div className="text-center text-sm">
          <span className="text-muted-foreground">¿Recordaste tu contraseña? </span>
          <Link
            href="/portal"
            className="text-primary hover:underline"
            data-test-id="portal-forgot-password-back-to-login"
          >
            Regresa al inicio de sesión
          </Link>
        </div>
      </div>
    </section>
  );
}
