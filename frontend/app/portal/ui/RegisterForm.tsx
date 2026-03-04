"use client";

import { useState, FormEvent } from "react";
import { TextField } from "@/shared/components/ui/TextField/TextField";
import { Button } from "@/shared/components/ui/Button/Button";
import { useAlert } from "@/shared/hooks/useAlert";
import { registerUserAction } from "@/features/shared/auth/actions/auth.action";

interface RegisterFormProps {
  onClose?: () => void;
  onRegisterClick?: () => void;
}

export default function RegisterForm({ onClose, onRegisterClick }: RegisterFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert } = useAlert();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validaciones de cliente
    if (!firstName.trim()) {
      showAlert({ message: "El nombre es requerido", type: "error" });
      return;
    }

    if (!lastName.trim()) {
      showAlert({ message: "El apellido es requerido", type: "error" });
      return;
    }

    if (!email.trim()) {
      showAlert({ message: "El correo electrónico es requerido", type: "error" });
      return;
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert({ message: "Correo electrónico inválido", type: "error" });
      return;
    }

    if (password.length < 8) {
      showAlert({
        message: "La contraseña debe tener al menos 8 caracteres",
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
      const result = await registerUserAction({
        firstName,
        lastName,
        email,
        password,
      });

      if (!result) {
        showAlert({
          message: 'No pudimos procesar tu solicitud en este momento. Intenta nuevamente.',
          type: 'error',
        });
        return;
      }

      if (result.success) {
        showAlert({
          message: result.message || "Registro exitoso",
          type: "success",
          duration: 5000,
        });
        
        // Limpiar formulario
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        
        // Cerrar diálogo
        if (onClose) onClose();
      } else {
        showAlert({
          message: result.error || "Error al registrar usuario",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Register error:", error);
      showAlert({
        message: "Error inesperado durante el registro",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" data-test-id="portal-register-form">
      <TextField
        label="Nombre"
        required
        value={firstName}
        onChange={(event) => setFirstName(event.target.value)}
        placeholder="Nombre"
        className="w-full"
        disabled={isSubmitting}
        data-test-id="portal-register-firstname"
      />
      
      <TextField
        label="Apellido"
        required
        value={lastName}
        onChange={(event) => setLastName(event.target.value)}
        placeholder="Apellido"
        className="w-full"
        disabled={isSubmitting}
        data-test-id="portal-register-lastname"
      />
      
      <TextField
        label="Correo electrónico"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="nombre@correo.com"
        className="w-full"
        disabled={isSubmitting}
        data-test-id="portal-register-email"
      />
      
      <TextField
        label="Contraseña"
        type="password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="••••••••"
        className="w-full"
        disabled={isSubmitting}
        data-test-id="portal-register-password"
      />
      
      <TextField
        label="Confirmar contraseña"
        type="password"
        required
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        placeholder="••••••••"
        className="w-full"
        disabled={isSubmitting}
        data-test-id="portal-register-password-confirm"
      />
      
      <Button
        variant="primary"
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-4"
        data-test-id="portal-register-submit"
      >
        {isSubmitting ? "Registrando..." : "Registrarse"}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        <span>¿Ya tienes cuenta? </span>
        <Button
          variant="text"
          className="text-primary p-0 h-auto font-normal"
          onClick={() => {
            if (onClose) onClose();
            if (onRegisterClick) onRegisterClick();
          }}
          type="button"
          data-test-id="portal-register-login-link"
        >
          Inicia sesión aquí
        </Button>
      </div>
    </form>
  );
}
