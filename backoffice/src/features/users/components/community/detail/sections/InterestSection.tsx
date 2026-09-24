'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LoadingState } from '@realestate/ui';
import {
  getCommunityUserInterestNotifications,
  type CommunityUserInterestItem,
} from '@/features/users/actions/users.action';

type InterestSectionProps = {
  userId: string;
  email: string;
};

function formatDate(value?: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('es-CL');
  } catch {
    return value;
  }
}

export function InterestSection({ userId, email }: InterestSectionProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CommunityUserInterestItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const result = await getCommunityUserInterestNotifications(userId, email);
      if (cancelled) return;
      if (!result.success) {
        setError(result.error || 'Error al cargar intereses');
        setItems([]);
      } else {
        setItems(result.data || []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, email]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingState label="Cargando intereses" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600" data-test-id="community-user-interest-error">
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <section
        className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground"
        data-test-id="community-user-interest-empty"
      >
        Sin solicitudes de interés registradas
      </section>
    );
  }

  return (
    <section className="space-y-3" data-test-id="community-user-interest-section">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-md border border-border p-3 space-y-1"
          data-test-id="community-user-interest-item"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            {item.propertyId ? (
              <Link
                href={`/properties/sales/${item.propertyId}`}
                className="text-sm font-medium hover:underline"
              >
                Propiedad {item.propertyId.slice(0, 8)}…
              </Link>
            ) : (
              <span className="text-sm font-medium">Interés en propiedad</span>
            )}
            <time className="text-xs text-muted-foreground">
              {formatDate(item.createdAt)}
            </time>
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {item.interestedUserMessage ||
              item.message?.split('\n\nMensaje:')[1]?.split('\n\n[PROPERTY')[0]?.trim() ||
              'Sin mensaje adicional.'}
          </p>
        </article>
      ))}
    </section>
  );
}
