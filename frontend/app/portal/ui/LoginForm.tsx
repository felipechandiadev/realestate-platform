"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TextField } from "@/shared/components/ui/TextField/TextField";
import { useAuth } from "@/app/providers";
import { useAlert } from "@/shared/hooks/useAlert";
import { Button } from "@/shared/components/ui/Button/Button";

interface LoginFormProps {
  onClose?: () => void;
  logoSrc?: string;
  companyName?: string;
  onRegisterClick?: () => void;
}

export default function LoginForm({ onClose, logoSrc, companyName, onRegisterClick }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResendButton, setShowResendButton] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { showAlert } = useAlert();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      console.log('Backend response:', result); // Log the backend response

      const ok = (result as any)?.success === true || (result as any)?.ok === true;
      if (!ok) {
        const err = (result as any)?.error;
        if (err === 'EMAIL_NOT_VERIFIED') {
          setError('Tu correo electrónico no ha sido verificado.');
          setShowResendButton(true);
        } else {
          setError(err || 'Credenciales inválidas');
        }
        setIsSubmitting(false);
        return;
      }

      const firstName = email.split('@')[0];
      showAlert({
        message: `¡Bienvenido ${firstName}! Login exitoso.`,
        type: 'success',
        duration: 3000,
      });

      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 100);

      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (unknownError) {
      console.error("Error en login", unknownError);
      setError("Ocurrió un error inesperado. Intenta nuevamente.");
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      if (!email) {
        alert('Por favor, ingresa tu correo electrónico antes de reenviar la verificación.');
        return;
      }
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      });
      alert('Correo de verificación reenviado. Revisa tu bandeja de entrada.');
    } catch (error) {
      console.error('Error al reenviar el correo:', error);
      alert('Hubo un problema al reenviar el correo. Intenta nuevamente.');
    }
  };

  const shouldRenderLogo = logoSrc && logoSrc.trim() !== "";

  return (
    <div className="flex flex-col gap-4" data-test-id="portal-login-form">
      {shouldRenderLogo && logoSrc ? (
        <div className="logo-container">
          <img src={logoSrc} className="logo" />
        </div>
      ) : null}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Correo electrónico"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="nombre@correo.com"
          className="w-full"
          data-test-id="portal-login-email"
        />
        <TextField
          label="Contraseña"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          className="w-full"
          data-test-id="portal-login-password"
        />
        <div className="flex justify-end mt-2">
          <Link
            href="/portal/forgot-password"
            className="text-xs text-primary hover:underline"
            onClick={() => onClose?.()}
            data-test-id="portal-login-forgot-password-link"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        {error && (
          <div className="text-red-600 mt-2">
            <p>{error}</p>
            {showResendButton && (
              <button onClick={handleResendVerification} className="underline text-blue-600">
                Reenviar correo de verificación
              </button>
            )}
          </div>
        )}
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-4"
        >
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          <span>¿No tienes cuenta? </span>
          <Button
            variant="text"
            className="text-primary p-0 h-auto font-normal"
            onClick={() => onRegisterClick?.()}
            type="button"
            data-test-id="portal-login-register-link"
          >
            Registrarse aquí
          </Button>
        </div>
      </form>
    </div>
  );
}

