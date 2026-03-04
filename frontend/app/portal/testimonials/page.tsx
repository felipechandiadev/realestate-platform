import React from 'react';
import { listPublicTestimonials, Testimonial } from '@/features/backoffice/cms/actions/testimonials.action';

export default async function TestimonialsPage() {
  const testimonials = await listPublicTestimonials();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Section */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
          Testimonios
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
          Descubre lo que nuestros clientes dicen sobre nuestra experiencia y servicio
        </p>
      </div>

      {/* Lista de testimonios */}
      <div className="flex flex-col items-center gap-8">
        {testimonials.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-gray-400 mx-auto mb-4" style={{ fontSize: '64px' }}>
              rate_review
            </span>
            <p className="text-muted-foreground">
              No hay testimonios disponibles por ahora.
            </p>
          </div>
        ) : (
          testimonials.map((t: Testimonial, idx: number) => {
            const isImageRight = idx % 2 === 0;
            return (
              <div
                key={t.id}
                className="w-full flex flex-col md:flex-row items-stretch justify-center max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] mx-auto bg-white shadow-lg rounded-xl"
              >
                {/* Columna de imagen/nombre/cargo */}
                <div
                  className={`flex flex-col items-center justify-center p-6 md:w-1/3 ${isImageRight ? 'md:order-2' : 'md:order-1'}`}
                >
                  {t.imageUrl && (
                    <img
                      src={t.imageUrl}
                      alt={t.name}
                      className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-primary"
                    />
                  )}
                  <div className="text-lg font-semibold text-primary mb-1 text-center">{t.name}</div>
                  {t.position && (
                    <div className="text-xs text-muted-foreground mb-2 text-center">{t.position}</div>
                  )}
                </div>
                {/* Columna de contenido */}
                <div className={`flex items-center md:w-2/3 px-6 py-8 ${isImageRight ? 'md:order-1' : 'md:order-2'}`}>
                  <div className="text-base text-muted-foreground font-light text-center md:text-left w-full break-words">
                    {t.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
