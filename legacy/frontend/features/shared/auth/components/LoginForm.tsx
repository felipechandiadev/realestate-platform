'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import { Button } from '@/shared/components/ui/Button/Button';
import Switch from '@/shared/components/ui/Switch/Switch';
import Alert from '@/shared/components/ui/Alert/Alert';
import Card from '@/shared/components/ui/Card/Card';
import { useLogin, useResendVerificationEmail } from '@/features/shared/auth/hooks';
import { LoginSchema, type LoginInput } from '@/features/shared/auth/validation';

/**
 * LoginForm component
 * 
 * Handles user authentication with email and password.
 * Includes remember me functionality and forgot password link.
 * 
 * @component
 */
export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { mutate: login, isPending, error } = useLogin();
  const {
    mutate: resendVerification,
    isPending: isResending,
    isSuccess: resendSuccess,
    isError: resendError,
  } = useResendVerificationEmail();
  
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Detect EMAIL_NOT_VERIFIED error
  const isEmailNotVerified = error && typeof error === 'string' && error === 'EMAIL_NOT_VERIFIED';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleRememberMeChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
  };

  const handleResendVerification = () => {
    resendVerification();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // Validate form data
    const validation = LoginSchema.safeParse(formData);
    
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    // Submit login
    login(validation.data, {
      onSuccess: () => {
        router.push('/');
      },
    });
  };

  return (
    <Card className="max-w-md mx-auto p-6" data-test-id="login-form-card">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Sign In</h2>
          <p className="text-sm text-secondary">Enter your credentials to access your account</p>
        </div>

        {error && (
          <Alert variant="error" data-test-id="login-error-alert">
            {isEmailNotVerified
              ? (
                  <>
                    Tu correo no está verificado. Revisa tu bandeja de entrada o solicita un nuevo correo de verificación.
                    <div className="mt-4 space-y-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleResendVerification}
                        disabled={isResending}
                        loading={isResending}
                        data-test-id="resend-verification-btn"
                        className="w-full"
                      >
                        {isResending ? (
                          <span className="flex items-center justify-center gap-2">
                            <span>Enviando</span>
                            <span className="flex gap-1">
                              <span className="w-1 h-1 bg-current rounded-full animate-pulse"></span>
                              <span className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                              <span className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                            </span>
                          </span>
                        ) : (
                          'Reenviar correo de verificación'
                        )}
                      </Button>
                      {resendSuccess && (
                        <p className="text-green-600 text-xs text-center">✓ Correo de verificación enviado. Revisa tu bandeja de entrada.</p>
                      )}
                      {resendError && (
                        <p className="text-red-600 text-xs text-center">✗ Error al enviar el correo. Intenta nuevamente.</p>
                      )}
                    </div>
                  </>
                )
              : (error as any)?.message || error || 'Invalid email or password. Please try again.'}
          </Alert>
        )}

        <TextField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          required
          disabled={isPending}
          data-test-id="login-email-field"
        />
        {fieldErrors.email && (
          <p className="text-sm text-red-500 mt-1" data-test-id="login-email-error">
            {fieldErrors.email}
          </p>
        )}

        <TextField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          disabled={isPending}
          passwordVisibilityToggle
          data-test-id="login-password-field"
        />
        {fieldErrors.password && (
          <p className="text-sm text-red-500 mt-1" data-test-id="login-password-error">
            {fieldErrors.password}
          </p>
        )}

        <div className="flex items-center justify-between">
          <Switch
            checked={formData.rememberMe}
            onChange={handleRememberMeChange}
            label="Remember me"
            labelPosition="right"
            data-test-id="login-remember-switch"
          />
          
          <Link 
            href="/auth/forgot-password" 
            className="text-sm text-primary hover:underline"
            data-test-id="login-forgot-link"
          >
            Forgot password?
          </Link>
        </div>

        {!isEmailNotVerified && (
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isPending}
            loading={isPending}
            data-test-id="login-submit-button"
          >
            {isPending ? 'Signing in...' : 'Sign In'}
          </Button>
        )}

        <div className="text-center text-sm mt-4">
          <span className="text-secondary">Don&apos;t have an account? </span>
          <Link 
            href="/auth/register" 
            className="text-primary hover:underline"
            data-test-id="login-register-link"
          >
            Sign up
          </Link>
        </div>
      </form>
    </Card>
  );
};
