'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import { Button } from '@/shared/components/ui/Button/Button';
import Alert from '@/shared/components/ui/Alert/Alert';
import Card from '@/shared/components/ui/Card/Card';
import { useResetPassword } from '@/features/shared/auth/hooks';
import { PasswordResetSchema } from '@/features/shared/auth/validation';
import type { PasswordReset } from '@/features/shared/auth/types';

/**
 * ResetPasswordForm component
 * 
 * Allows users to reset their password using a token from their email.
 * Validates password confirmation and redirects to login upon success.
 * 
 * @component
 */
export const ResetPasswordForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: resetPassword, isPending, error, isSuccess } = useResetPassword();
  
  const [token, setToken] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    passwordConfirm: '',
  });
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Get token from URL params
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!token) {
      setFieldErrors({ token: 'Invalid or missing reset token' });
      return;
    }

    // Validate form data
    const data = {
      token,
      password: formData.password,
      passwordConfirm: formData.passwordConfirm,
    };
    
    const validation = PasswordResetSchema.safeParse(data);
    
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

    // Submit password reset
    const resetData: PasswordReset = validation.data;
    resetPassword(resetData, {
      onSuccess: () => {
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/auth/login?reset=success');
        }, 2000);
      },
    });
  };

  if (isSuccess) {
    return (
      <Card className="max-w-md mx-auto p-6" data-test-id="reset-password-success-card">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold mb-2">Password Reset Successful</h2>
        </div>

        <Alert variant="success" data-test-id="reset-password-success-alert">
          <div>
            <p className="font-semibold mb-1">Your password has been reset!</p>
            <p className="text-sm">You can now sign in with your new password.</p>
          </div>
        </Alert>

        <div className="text-center mt-6">
          <Link 
            href="/auth/login" 
            className="text-sm text-primary hover:underline"
            data-test-id="reset-password-login-link"
          >
            Go to login
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto p-6" data-test-id="reset-password-form-card">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Reset Password</h2>
          <p className="text-sm text-secondary">Enter your new password below.</p>
        </div>

        {!token && (
          <Alert variant="error" data-test-id="reset-password-token-error">
            Invalid or missing reset token. Please request a new password reset link.
          </Alert>
        )}

        {error && (
          <Alert variant="error" data-test-id="reset-password-error-alert">
            {(error as any)?.message || 'Failed to reset password. Please try again or request a new reset link.'}
          </Alert>
        )}

        <TextField
          label="New Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          disabled={isPending || !token}
          passwordVisibilityToggle
          data-test-id="reset-password-password-field"
        />
        {fieldErrors.password && (
          <p className="text-sm text-red-500 mt-1" data-test-id="reset-password-password-error">
            {fieldErrors.password}
          </p>
        )}

        <TextField
          label="Confirm New Password"
          name="passwordConfirm"
          type="password"
          value={formData.passwordConfirm}
          onChange={handleChange}
          placeholder="••••••••"
          required
          disabled={isPending || !token}
          passwordVisibilityToggle
          data-test-id="reset-password-password-confirm-field"
        />
        {fieldErrors.passwordConfirm && (
          <p className="text-sm text-red-500 mt-1" data-test-id="reset-password-password-confirm-error">
            {fieldErrors.passwordConfirm}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isPending || !token}
          loading={isPending}
          data-test-id="reset-password-submit-button"
        >
          {isPending ? 'Resetting password...' : 'Reset Password'}
        </Button>

        <div className="text-center text-sm mt-4">
          <Link 
            href="/auth/forgot-password" 
            className="text-primary hover:underline"
            data-test-id="reset-password-back-link"
          >
            Request new reset link
          </Link>
        </div>
      </form>
    </Card>
  );
};
