'use client';

import React from 'react';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import LazyImage from '@/shared/components/ui/LazyImage';
import { env } from '@/lib/env';
import type { Testimonial } from '@/features/backoffice/cms/actions/testimonials.action';

export interface TestimonialCardProps {
  testimonial: Testimonial;
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (testimonial: Testimonial) => void;
}

const normalizeMediaUrl = (url?: string): string | undefined => {
  if (!url) return undefined;

  const trimmed = url.trim();
  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    if (trimmed.startsWith('/')) {
      return `${env.backendApiUrl.replace(/\/$/, '')}${trimmed}`;
    }
    return trimmed;
  }
};

export function TestimonialCard({
  testimonial,
  onEdit,
  onDelete,
}: TestimonialCardProps) {

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
      {/* Avatar */}
      <div className="flex items-center justify-center p-6 border-b border-border bg-gray-100">
        {testimonial.multimedia ? (
          <LazyImage
            multimedia={testimonial.multimedia}
            variantType="avatar-md"
            alt={testimonial.name}
            sizes="128px"
            className="w-24 h-24 rounded-full object-cover"
            maintainAspectRatio={true}
          />
        ) : testimonial.imageUrl ? (
          <LazyImage
            multimedia={{
              id: testimonial.id || 'testimonial-' + Date.now(),
              url: normalizeMediaUrl(testimonial.imageUrl) || '',
              filename: 'avatar.jpg',
              variants: []
            }}
            variantType="avatar-md"
            alt={testimonial.name}
            sizes="128px"
            className="w-24 h-24 rounded-full object-cover"
            maintainAspectRatio={true}
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-400" style={{ fontSize: '40px' }}>
              person
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2 flex-1 py-2 px-4">
        <h3 className="text-lg font-semibold text-foreground">{testimonial.name}</h3>

        {testimonial.position && (
          <p className="text-sm text-muted-foreground">{testimonial.position}</p>
        )}

        <p className="text-sm text-foreground line-clamp-3">{testimonial.content}</p>
      </div>

      {/* Footer - Actions */}
      <div className="flex justify-end items-center gap-2 px-4 pb-2">
        <IconButton
          icon="edit"
          variant="text"
          onClick={() => onEdit(testimonial)}
          ariaLabel="Editar testimonio"
        />
        <IconButton
          icon="delete"
          variant="text"
          onClick={() => onDelete(testimonial)}
          className="text-red-500"
          ariaLabel="Eliminar testimonio"
        />
      </div>
    </div>
  );
}
