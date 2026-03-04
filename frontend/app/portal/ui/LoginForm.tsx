"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TextField } from "@/shared/components/ui/TextField/TextField";
import { useAuth } from "@/app/providers";
import { useAlert } from "@/shared/hooks/useAlert";
import Logo from "@/shared/components/ui/Logo/Logo";
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
  const router = useRouter();
  const { login } = useAuth();
  const { showAlert } = useAlert();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login(email, password);

      // Support both our login return ({ success: true }) and NextAuth shape ({ ok: true })
      const ok = (result as any)?.success === true || (result as any)?.ok === true;
      if (!ok) {
        const err = (result as any)?.error ?? "Credenciales inválidas";
        setError(err);
        setIsSubmitting(false);
        return;
      }

      // Mostrar alerta de bienvenida con nombre extraído del email
      const firstName = email.split('@')[0];
      showAlert({
        message: `¡Bienvenido ${firstName}! Login exitoso.`,
        type: 'success',
        duration: 3000,
      });

      // Cerrar el dialog inmediatamente - sin delay
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 100);

      // Refrescar la página para que el middleware pueda redirigir si es necesario
      // (ADMIN/AGENT irán a backOffice, COMMUNITY permanecerán en portal)
      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (unknownError) {
      console.error("Error en login", unknownError);
      setError("Ocurrió un error inesperado. Intenta nuevamente.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4" data-test-id="portal-login-form">
      {logoSrc && (

        <div>
          <div className="flex justify-center mb-4">
            <Logo src={logoSrc} className="w-48 h-20 md:w-64 md:h-24" aspect={{ w: 4, h: 1 }} />

          </div>
          <div className="text-center text-sm text-foreground text-xl">
            {companyName || "nuestro portal"}
          </div>
        </div>

      )}
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
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
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