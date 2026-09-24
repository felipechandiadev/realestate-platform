'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LoadingState } from '@realestate/ui';
import { getUserFavoriteProperties } from '@/features/users/actions/users.action';

type FavoritesSectionProps = {
  userId: string;
};

export function FavoritesSection({ userId }: FavoritesSectionProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserFavoriteProperties(userId);
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar favoritos');
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingState label="Cargando favoritos" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600" data-test-id="community-user-favorites-error">
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <section
        className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground"
        data-test-id="community-user-favorites-empty"
      >
        No tiene propiedades favoritas
      </section>
    );
  }

  return (
    <section className="space-y-4" data-test-id="community-user-favorites-section">
      <p className="text-sm text-muted-foreground">{items.length} favorito(s)</p>
      <ul className="space-y-3">
        {items.map((property) => {
          const id = property.id || property.propertyId;
          const op = String(property.operationType || '').toUpperCase();
          const href = `/properties/sales/${id}`;
          const imageUrl =
            property.mainImageUrl ||
            property.multimedia?.[0]?.url ||
            null;
          return (
            <li
              key={id}
              className="flex gap-3 rounded-md border border-border p-3"
              data-test-id="community-user-favorite-item"
            >
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  className="h-16 w-20 rounded object-cover bg-muted"
                />
              ) : (
                <div className="flex h-16 w-20 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                  Sin foto
                </div>
              )}
              <div className="min-w-0 flex-1">
                <Link
                  href={href}
                  className="font-medium text-foreground hover:underline"
                >
                  {property.title || 'Sin título'}
                </Link>
                <p className="text-xs text-muted-foreground font-mono">
                  {property.code || id}
                </p>
                <p className="text-xs text-muted-foreground">
                  {property.status || '—'}
                  {op ? ` · ${op === 'RENT' ? 'Arriendo' : 'Venta'}` : ''}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
