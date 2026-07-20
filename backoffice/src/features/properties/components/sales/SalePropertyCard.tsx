'use client';

import React from 'react';
import { Card } from '@realestate/ui';
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

export function SalePropertyCard({ property, onDeleteSuccess }: SalePropertyCardProps) {
  const status = property.status ?? '';
  const mainImageUrl =
    typeof property.mainImageUrl === 'string' ? property.mainImageUrl : undefined;

  const media = (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
      {mainImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mainImageUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          Sin imagen
        </div>
      )}
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
