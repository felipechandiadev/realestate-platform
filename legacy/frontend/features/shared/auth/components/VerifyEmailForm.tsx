'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/Button/Button';
import Alert from '@/shared/components/ui/Alert/Alert';
import Card from '@/shared/components/ui/Card/Card';
import { useVerifyEmail, useResendVerificationEmail } from '@/features/shared/auth/hooks';

/**
 * VerifyEmailForm component
 * 
 * Automatically verifies user email using token from URL.
 * Displays verification status and allows resending verification email.
 * Redirects to home upon successful verification.
 * 
 * @component
 */
export const VerifyEmailForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: verifyEmail, isPending, error, isSuccess } = useVerifyEmail();
  const { mutate: resendEmail, isPending: isResending, isSuccess: isResent } = useResendVerificationEmail();
  
  const [token, setToken] = useState<string | null>(null);
  const [hasAttemptedVerification, setHasAttemptedVerification] = useState(false);

  useEffect(() => {
    // Get token from URL params
    const tokenParam = searchParams.get('token');
    setToken(tokenParam);
    
    // Auto-verify if token exists and haven't attempted yet
    if (tokenParam && !hasAttemptedVerification) {
      setHasAttemptedVerification(true);
      verifyEmail(tokenParam, {
        onSuccess: () => {
          // Redirect to home after 2 seconds
          setTimeout(() => {
            router.push('/?verified=true');
          }, 2000);
        },
      });
    }
  }, [searchParams, verifyEmail, hasAttemptedVerification, router]);

  const handleResend = () => {
    resendEmail();
  };

  // Loading state - verifying
  if (isPending) {
    return (
      <Card className="max-w-md mx-auto p-6" data-test-id="verify-email-loading-card">
        <div className="text-center space-y-4">
            <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">Verifying Your Email</h2>
            <p className="text-sm text-secondary">Please wait while we verify your email address...</p>
          </div>
        </div>
      </Card>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <Card className="max-w-md mx-auto p-6" data-test-id="verify-email-success-card">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold mb-2">Email Verified!</h2>
        </div>

        <Alert variant="success" data-test-id="verify-email-success-alert">
          <div>
            <p className="font-semibold mb-1">Your email has been successfully verified!</p>
            <p className="text-sm">You will be redirected to the homepage shortly...</p>
          </div>
        </Alert>

        <div className="text-center mt-6">
          <Button
            variant="primary"
            onClick={() => router.push('/')}
            data-test-id="verify-email-home-button"
          >
            Go to Homepage
          </Button>
        </div>
      </Card>
    );
  }

  // Error state
  if (error || !token) {
    return (
      <Card className="max-w-md mx-auto p-6" data-test-id="verify-email-error-card">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold mb-2">Verification Failed</h2>
        </div>

        <Alert variant="error" data-test-id="verify-email-error-alert">
          <div>
            <p className="font-semibold mb-1">Failed to verify your email</p>
            <p className="text-sm">
              {!token 
                ? 'Invalid or missing verification token.' 
                : (error as any)?.message || 'The verification link may have expired or is invalid.'}
            </p>
          </div>
        </Alert>

        {isResent && (
          <Alert variant="success" className="mt-4" data-test-id="verify-email-resent-alert">
            <p className="text-sm">Verification email sent! Please check your inbox.</p>
          </Alert>
        )}

        <div className="text-center space-y-4 mt-6">
          <div>
            <p className="text-sm text-secondary mb-2">Need a new verification link?</p>
            <Button
              variant="primary"
              onClick={handleResend}
              disabled={isResending}
              loading={isResending}
              data-test-id="verify-email-resend-button"
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Link 
              href="/auth/login" 
              className="text-sm text-primary hover:underline"
              data-test-id="verify-email-login-link"
            >
              Back to login
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return null;
};
