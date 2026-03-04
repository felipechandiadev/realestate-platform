"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "@/shared/components/ui/TextField/TextField";
import { Button } from "@/shared/components/ui/Button/Button";
import { useAlert } from "@/shared/hooks/useAlert";
import { resetPassword } from "@/features/shared/auth/actions/auth.action";

interface ResetPasswordFormProps {
  token: string;
  emailHint: string;
}

export default function ResetPasswordForm({ token, emailHint }: ResetPasswordFormProps) {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < 8) {
      showAlert({
        message: "La contraseña debe tener al menos 8 caracteres",
        type: "error",
      });
      return;
    }

    const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordPolicy.test(password)) {
      showAlert({
        message: "La contraseña debe incluir minúsculas, mayúsculas y números",
        type: "error",
      });
      return;
    }

    if (password !== confirmPassword) {
      showAlert({
        message: "Las contraseñas no coinciden",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await resetPassword({
        token,
        newPassword: password,
        confirmPassword: confirmPassword,
      });

      if (result.success) {
        showAlert({
          message: result.message || "Contraseña restablecida correctamente",
          type: "success",
          duration: 6000,
        });
        setTimeout(() => {
          router.push("/portal");
        }, 500);
      } else {
        showAlert({
          message: result.error || "No fue posible restablecer la contraseña",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error resetting password", error);
      showAlert({
        message: "Ocurrió un error inesperado. Intenta nuevamente.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-4"
      data-test-id="portal-reset-password-form"
    >
      <p className="text-sm text-muted-foreground">
        Restablecerás la contraseña de la cuenta asociada a <strong>{emailHint}</strong>.
      </p>

      <TextField
        label="Nueva contraseña"
        type="password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="••••••••"
        disabled={isSubmitting}
        data-test-id="portal-reset-password-new"
      />

      <TextField
        label="Confirmar contraseña"
        type="password"
        required
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        placeholder="••••••••"
        disabled={isSubmitting}
        data-test-id="portal-reset-password-confirm"
      />

      <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
        <li>Al menos 8 caracteres</li>
        <li>Incluye letras minúsculas y mayúsculas</li>
        <li>Incluye al menos un número</li>
      </ul>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={isSubmitting}
        data-test-id="portal-reset-password-submit"
      >
        {isSubmitting ? "Actualizando..." : "Guardar nueva contraseña"}
      </Button>
    </form>
  );
}
