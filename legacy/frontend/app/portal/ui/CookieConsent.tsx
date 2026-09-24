'use client';

import { Button } from '@/shared/components/ui/Button/Button';
import { useCookieConsent } from '@/providers/CookieConsentContext';

export default function CookieConsent() {
  const { consentStatus, acceptCookies, rejectCookies } = useCookieConsent();

  // Don't show if user has already made a choice
  if (consentStatus !== 'pending') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full md:w-auto">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Política de Cookies
          </h2>
          <p className="text-sm text-gray-600">
            Utilizamos cookies para mejorar tu experiencia en nuestro sitio web. Estas cookies nos ayudan a entender cómo utilizas el sitio y a ofrecerte contenido personalizado.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={rejectCookies}
            variant="outlined"
            className="flex-1"
          >
            Rechazar
          </Button>
          <Button
            onClick={acceptCookies}
            variant="primary"
            className="flex-1"
          >
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  );
}
