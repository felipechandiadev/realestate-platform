'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, IconButton } from '@realestate/ui';
import type { SalePropertyGridRow } from '@/features/properties/actions/properties.action';
import {
  formatPropertyPrice,
  getStatusChipClasses,
  getStatusInSpanish,
} from '@/features/properties/utils';
import { PropertiesDeleteButton } from '@/features/properties/components/shared';
import SaleMoreButton from './SaleMoreButton';

interface SalePropertyCardProps {
  property: SalePropertyGridRow;
  onDeleteSuccess?: () => void;
}

function resolveCardImageUrls(property: SalePropertyGridRow): string[] {
  if (Array.isArray(property.imageUrls) && property.imageUrls.length > 0) {
    return property.imageUrls.filter((u): u is string => typeof u === 'string' && u.trim() !== '');
  }

  const urls: string[] = [];
  const push = (raw?: string | null) => {
    const url = typeof raw === 'string' ? raw.trim() : '';
    if (!url || urls.includes(url)) return;
    urls.push(url);
  };

  push(property.mainImageUrl);

  const multimedia = Array.isArray(property.multimedia) ? property.multimedia : [];
  for (const media of multimedia) {
    const format = String(media?.format || '').toUpperCase();
    if (format && format !== 'IMG') continue;
    push(media?.url);
  }

  return urls;
}

export function SalePropertyCard({ property, onDeleteSuccess }: SalePropertyCardProps) {
  const status = property.status ?? '';
  const imageUrls = useMemo(() => resolveCardImageUrls(property), [property]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [property.id, imageUrls.length]);

  const safeIndex = imageUrls.length > 0 ? Math.min(index, imageUrls.length - 1) : 0;
  const currentUrl = imageUrls[safeIndex];
  const canNavigate = imageUrls.length > 1;

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev <= 0 ? imageUrls.length - 1 : prev - 1));
  };

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev >= imageUrls.length - 1 ? 0 : prev + 1));
  };

  const media = (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
      {currentUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          Sin imagen
        </div>
      )}

      {canNavigate ? (
        <>
          <IconButton
            icon="ChevronLeft"
            variant="primaryCircle"
            size="xs"
            className="absolute left-2 top-1/2 z-[1] -translate-y-1/2 shadow-md"
            ariaLabel="Imagen anterior"
            onClick={goPrev}
            data-test-id={`sale-property-card-prev-${property.id}`}
          />
          <IconButton
            icon="ChevronRight"
            variant="primaryCircle"
            size="xs"
            className="absolute right-2 top-1/2 z-[1] -translate-y-1/2 shadow-md"
            ariaLabel="Imagen siguiente"
            onClick={goNext}
            data-test-id={`sale-property-card-next-${property.id}`}
          />
          <div className="pointer-events-none absolute bottom-2 left-1/2 z-[1] flex -translate-x-1/2 gap-1">
            {imageUrls.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${
                  i === safeIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );

  const statusChip = status ? (
    <span
      className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${getStatusChipClasses(status)}`}
    >
      {getStatusInSpanish(status)}
    </span>
  ) : null;

  return (
    <Card
      fillHeight
      media={media}
      title={property.title || 'Sin título'}
      subtitle={property.code ? `Código ${property.code}` : undefined}
      headerEnd={statusChip}
      content={
        <div className="flex h-full flex-col gap-3">
          <dl className="grid gap-1 text-sm">
            {property.typeName ? (
              <div>
                <dt className="inline text-muted-foreground">Tipo: </dt>
                <dd className="inline">{property.typeName}</dd>
              </div>
            ) : null}
            {property.city ? (
              <div>
                <dt className="inline text-muted-foreground">Ciudad: </dt>
                <dd className="inline">{property.city}</dd>
              </div>
            ) : null}
            {property.assignedAgentName ? (
              <div>
                <dt className="inline text-muted-foreground">Agente: </dt>
                <dd className="inline">{property.assignedAgentName}</dd>
              </div>
            ) : null}
          </dl>

          <p className="text-lg font-semibold tabular-nums">
            {formatPropertyPrice(property.price, property.currencyPrice)}
          </p>

          <div className="mt-auto flex items-center justify-end gap-2 border-t border-border pt-3">
            <SaleMoreButton property={property} />
            <PropertiesDeleteButton propertyId={property.id} onSuccess={onDeleteSuccess} />
          </div>
        </div>
      }
      data-test-id={`sale-property-card-${property.id}`}
    />
  );
}
