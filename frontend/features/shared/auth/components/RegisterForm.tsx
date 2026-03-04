'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import { Button } from '@/shared/components/ui/Button/Button';
import Switch from '@/shared/components/ui/Switch/Switch';
import Alert from '@/shared/components/ui/Alert/Alert';
import Card from '@/shared/components/ui/Card/Card';
import { useRegister } from '@/features/shared/auth/hooks';
import { RegisterSchema, type RegisterInput } from '@/features/shared/auth/validation';

/**
 * RegisterForm component
 * 
 * Handles new user registration with email, password, and personal information.
 * Includes password confirmation validation and terms acceptance.
 * 
 * @component
 */
export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { mutate: register, isPending, error, isSuccess } = useRegister();
  
  const [formData, setFormData] = useState<RegisterInput>({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    acceptTerms: false,
  });
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  const handleTermsChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, acceptTerms: checked }));
    
    if (fieldErrors.acceptTerms) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.acceptTerms;
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // Validate form data
    const validation = RegisterSchema.safeParse(formData);
    
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

    // Submit registration
    register(validation.data, {
      onSuccess: () => {
        // Registration successful - show success message or redirect
        setTimeout(() => {
          router.push('/auth/login?registered=true');
        }, 2000);
      },
    });
  };

  if (isSuccess) {
    return (
      <Card className="max-w-md mx-auto p-6" data-test-id="register-success-card">
        <Alert variant="success" data-test-id="register-success-alert">
          <div>
            <p className="font-semibold mb-1">Registration successful!</p>
            <p className="text-sm">Please check your email to verify your account.</p>
          </div>
        </Alert>
        <div className="text-center mt-4">
          <Link 
            href="/auth/login" 
            className="text-sm text-primary hover:underline"
            data-test-id="register-success-login-link"
          >
            Go to login
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto p-6" data-test-id="register-form-card">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Create Account</h2>
          <p className="text-sm text-secondary">Sign up to get started</p>
        </div>

        {error && (
          <Alert variant="error" data-test-id="register-error-alert">
            {(error as any)?.message || 'Registration failed. Please try again.'}
          </Alert>
        )}

        <TextField
          label="Full Name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          required
          disabled={isPending}
          data-test-id="register-name-field"
        />
        {fieldErrors.name && (
          <p className="text-sm text-red-500 mt-1" data-test-id="register-name-error">
            {fieldErrors.name}
          </p>
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
          data-test-id="register-email-field"
        />
        {fieldErrors.email && (
          <p className="text-sm text-red-500 mt-1" data-test-id="register-email-error">
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
          data-test-id="register-password-field"
        />
        {fieldErrors.password && (
          <p className="text-sm text-red-500 mt-1" data-test-id="register-password-error">
            {fieldErrors.password}
          </p>
        )}

        <TextField
          label="Confirm Password"
          name="passwordConfirm"
          type="password"
          value={formData.passwordConfirm}
          onChange={handleChange}
          placeholder="••••••••"
          required
          disabled={isPending}
          passwordVisibilityToggle
          data-test-id="register-password-confirm-field"
        />
        {fieldErrors.passwordConfirm && (
          <p className="text-sm text-red-500 mt-1" data-test-id="register-password-confirm-error">
            {fieldErrors.passwordConfirm}
          </p>
        )}

          <div className="flex items-start gap-2">
          <Switch
            checked={formData.acceptTerms}
            onChange={handleTermsChange}
            data-test-id="register-terms-switch"
          />
            <div className="flex-1">
              <label className="text-sm font-light cursor-pointer">
                I accept the{' '}
                <Link 
                  href="/terms" 
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms and Conditions
                </Link>
              </label>
              {fieldErrors.acceptTerms && (
            <p className="text-sm text-red-500" data-test-id="register-terms-error">
              {fieldErrors.acceptTerms}
            </p>
              )}
            </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isPending}
          loading={isPending}
          data-test-id="register-submit-button"
        >
          {isPending ? 'Creating account...' : 'Create Account'}
        </Button>

        <div className="text-center text-sm mt-4">
          <span className="text-secondary">Already have an account? </span>
          <Link 
            href="/auth/login" 
            className="text-primary hover:underline"
            data-test-id="register-login-link"
          >
            Sign in
          </Link>
        </div>
      </form>
    </Card>
  );
};
