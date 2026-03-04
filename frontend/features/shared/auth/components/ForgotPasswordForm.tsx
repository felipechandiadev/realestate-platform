'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import { Button } from '@/shared/components/ui/Button/Button';
import Alert from '@/shared/components/ui/Alert/Alert';
import Card from '@/shared/components/ui/Card/Card';
import { useRequestPasswordReset } from '@/features/shared/auth/hooks';
import { PasswordResetRequestSchema } from '@/features/shared/auth/validation';
import type { PasswordResetRequest } from '@/features/shared/auth/types';

/**
 * ForgotPasswordForm component
 * 
 * Allows users to request a password reset email.
 * Displays success message upon successful submission.
 * 
 * @component
 */
export const ForgotPasswordForm: React.FC = () => {
  const { mutate: requestReset, isPending, error, isSuccess } = useRequestPasswordReset();
  
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEmail(e.target.value);
    
    // Clear field error when user starts typing
    if (fieldError) {
      setFieldError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError('');

    // Validate email
    const validation = PasswordResetRequestSchema.safeParse({ email });
    
    if (!validation.success) {
      const error = validation.error.errors[0];
      if (error) {
        setFieldError(error.message);
      }
      return;
    }

    // Submit password reset request
    const data: PasswordResetRequest = { email: validation.data.email };
    requestReset(data);
  };

  if (isSuccess) {
    return (
      <Card className="max-w-md mx-auto p-6" data-test-id="forgot-password-success-card">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold mb-2">Check Your Email</h2>
        </div>

        <Alert variant="success" data-test-id="forgot-password-success-alert">
          <div>
            <p className="font-semibold mb-1">Password reset email sent!</p>
            <p className="text-sm">
              We&apos;ve sent a password reset link to <strong>{email}</strong>.
              Please check your inbox and follow the instructions.
            </p>
          </div>
        </Alert>

        <div className="text-center mt-6">
          <p className="text-sm text-secondary mb-2">Didn&apos;t receive the email?</p>
          <Button
            type="button"
            variant="text"
            onClick={() => {
              requestReset({ email });
            }}
            disabled={isPending}
            data-test-id="forgot-password-resend-button"
          >
            Resend email
          </Button>
        </div>

        <div className="text-center mt-6">
          <Link 
            href="/auth/login" 
            className="text-sm text-primary hover:underline"
            data-test-id="forgot-password-back-link"
          >
            Back to login
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto p-6" data-test-id="forgot-password-form-card">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Forgot Password?</h2>
          <p className="text-sm text-secondary">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <Alert variant="error" data-test-id="forgot-password-error-alert">
            {(error as any)?.message || 'Failed to send reset email. Please try again.'}
          </Alert>
        )}

        <TextField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={handleChange}
          placeholder="your@email.com"
          required
          disabled={isPending}
          data-test-id="forgot-password-email-field"
        />
        {fieldError && (
          <p className="text-sm text-red-500 mt-1" data-test-id="forgot-password-email-error">
            {fieldError}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isPending}
          loading={isPending}
          data-test-id="forgot-password-submit-button"
        >
          {isPending ? 'Sending...' : 'Send Reset Link'}
        </Button>

        <div className="text-center text-sm mt-4">
          <Link 
            href="/auth/login" 
            className="text-primary hover:underline"
            data-test-id="forgot-password-login-link"
          >
            Back to login
          </Link>
        </div>
      </form>
    </Card>
  );
};
