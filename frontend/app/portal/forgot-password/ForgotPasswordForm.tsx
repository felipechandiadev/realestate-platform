"use client";

import { FormEvent, useState } from "react";
import { TextField } from "@/shared/components/ui/TextField/TextField";
import { Button } from "@/shared/components/ui/Button/Button";
import { useAlert } from "@/shared/hooks/useAlert";
import { requestPasswordReset } from "@/features/shared/auth/actions/auth.action";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { showAlert } = useAlert();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      showAlert({ message: "Ingresa un correo electrónico válido", type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await requestPasswordReset({ email });

      if (result.success) {
        setIsCompleted(true);
        showAlert({
          message:
            result.message ||
            "Si el correo existe, recibirás instrucciones para restablecer la contraseña.",
          type: "success",
          duration: 6000,
        });
      } else {
        showAlert({
          message: result.error || "No fue posible procesar tu solicitud. Intenta nuevamente.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error requesting password reset", error);
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
      className="w-full max-w-md flex flex-col items-center gap-4"
      data-test-id="portal-forgot-password-form"
    >
      <div className="w-full max-w-sm">
        <TextField
          label="Correo electrónico"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="nombre@correo.com"
          disabled={isSubmitting || isCompleted}
          data-test-id="portal-forgot-password-email"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        className="px-8 mx-auto"
        disabled={isSubmitting || isCompleted}
        data-test-id="portal-forgot-password-submit"
      >
        {isSubmitting ? "Enviando..." : isCompleted ? "Enlace enviado" : "Enviar instrucciones"}
      </Button>
    </form>
  );
}
