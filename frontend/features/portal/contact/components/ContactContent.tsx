'use client';

import React from 'react';
import Card from '@/shared/components/ui/Card/Card';
import ContactForm from './ContactForm';

interface ContactContentProps {
  className?: string;
}

/**
 * ContactContent component
 * 
 * Main container for the contact page.
 * Displays company contact information alongside the ContactForm.
 * Provides a complete contact experience for portal users.
 * 
 * @param {string} className - Additional CSS classes
 */
export default function ContactContent({
  className = '',
}: ContactContentProps) {
  const handleSuccess = () => {
    // Optional: scroll to top or show additional confirmation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`contact-content ${className}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4 text-center">
            Contáctenos
          </h1>
          <p className="text-gray-600 text-center mb-8">
            ¿Tiene alguna pregunta o consulta? Estamos aquí para ayudarle.
            Complete el formulario y nos pondremos en contacto con usted a la brevedad.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <h2 className="text-xl font-semibold mb-4">
                  Información de Contacto
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">Correo Electrónico</h3>
                    <a
                      href="mailto:info@realestate.cl"
                      className="text-primary hover:underline"
                    >
                      info@realestate.cl
                    </a>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">Teléfono</h3>
                    <a
                      href="tel:+56221234567"
                      className="text-primary hover:underline"
                    >
                      +56 2 2123 4567
                    </a>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">Dirección</h3>
                    <p className="text-gray-600">
                      Av. Providencia 123<br />
                      Santiago, Chile
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">Horario de Atención</h3>
                    <p className="text-gray-600">
                      Lunes a Viernes<br />
                      9:00 - 18:00
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <h2 className="text-xl font-semibold mb-6">
                  Envíenos un Mensaje
                </h2>
                <ContactForm onSuccess={handleSuccess} />
              </Card>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Al enviar este formulario, usted acepta nuestra{' '}
              <a href="/politica-privacidad" className="text-primary hover:underline">
                Política de Privacidad
              </a>{' '}
              y nuestros{' '}
              <a href="/terminos-condiciones" className="text-primary hover:underline">
                Términos y Condiciones
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
