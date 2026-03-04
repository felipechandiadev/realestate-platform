import React from 'react'
import { Testimonial } from '@/features/backoffice/cms/actions/testimonials.action'

export interface TestimonialsBandProps {
  testimonials: Testimonial[]
  limit?: number
}

export default function TestimonialsBand({ testimonials, limit = 4 }: TestimonialsBandProps) {
  const items = (testimonials || []).slice(0, limit)
  if (!items.length) return null

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">Testimonios</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
          Lo que dicen nuestros clientes
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((t) => (
          <article key={t.id} className="bg-card rounded-lg p-6 border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            {t.imageUrl ? (
              <div className="mb-4 flex items-center justify-center">
                <img src={t.imageUrl} alt={t.name} className="w-20 h-20 rounded-full object-cover border-2 border-primary" />
              </div>
            ) : null}

            <div className="flex-1">
              <h3 className="text-sm font-semibold text-primary text-center">{t.name}</h3>
              {t.position && <p className="text-xs text-muted-foreground text-center mb-2">{t.position}</p>}
              <p className="text-sm text-foreground mt-2 line-clamp-4 break-words">{t.content}</p>
            </div>
          </article>
        ))}
      </div>

      {/* Show link to full testimonials page when there are more than the limit */}
      {testimonials.length > limit && (
        <div className="mt-6 text-center">
          <a href="/portal/testimonials" className="text-sm text-primary hover:underline">Ver todos los testimonios</a>
        </div>
      )}
    </section>
  )
}
