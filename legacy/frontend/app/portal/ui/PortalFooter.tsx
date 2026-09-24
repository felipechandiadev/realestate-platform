'use client'

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faFacebook,
  faLinkedin,
  faYoutube
} from "@fortawesome/free-brands-svg-icons";
import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { getIdentity } from "@/features/backoffice/cms/actions/identity.action";
import Dialog from "@/shared/components/ui/Dialog/Dialog";
import { Button } from "@/shared/components/ui/Button/Button";

interface SocialMediaItem {
  url?: string;
  available?: boolean;
}

interface SocialMedia {
  instagram?: SocialMediaItem;
  facebook?: SocialMediaItem;
  linkedin?: SocialMediaItem;
  youtube?: SocialMediaItem;
}

interface Partnership {
  name: string;
  description: string;
  logoUrl?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface Identity {
  id?: string;
  name: string;
  address: string;
  phone: string;
  mail: string;
  businessHours: string;
  urlLogo?: string;
  socialMedia?: SocialMedia;
  partnerships?: Partnership[];
  faqs?: FAQItem[];
}

const PortalFooter: React.FC = () => {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);

  useEffect(() => {
    async function loadIdentity() {
      try {
        const data = await getIdentity();
        if (data) {
          setIdentity(data);
        }
      } catch (error) {
        console.error('Error loading identity:', error);
      } finally {
        setLoading(false);
      }
    }
    loadIdentity();
  }, []);

  if (loading) {
    return (
      <footer className="bg-foreground text-background p-8 mt-12 border-t border-border">
        <div className="container mx-auto text-center">
          <div className="text-background">Cargando...</div>
        </div>
      </footer>
    );
  }

  const handleImageError = (imageKey: string) => {
    setFailedImages(prev => new Set([...prev, imageKey]));
  };

  const navigationLinks = [
    { label: "Inicio", href: "/portal" },
    { label: "Arriendos", href: "/portal/properties/rent" },
    { label: "Ventas", href: "/portal/properties/sale" },
    { label: "Administraciones", href: "/portal/services/management" },
    { label: "Publica tu propiedad", href: "/portal/publish" },
    { label: "Nuestro equipo", href: "/portal/ourTeam" },
    { label: "Testimonios", href: "/portal/testimonials" },
    { label: "Blog", href: "/portal/blog" },
  ];

  const partnerships = identity?.partnerships ?? [];
  const faqs = identity?.faqs ?? []; 

  return (
    <footer className="bg-foreground text-background p-8 mt-12 border-t border-border">
      <div className="container mx-auto flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <h3 className="text-lg font-semibold text-background text-center">Nuestras alianzas</h3>
          <div className="flex flex-wrap gap-6 justify-center">
            {partnerships.length > 0 ? (
              partnerships.map((partnership, index) => {
                const imageKey = `partnership-${index}`;
                const imageError = failedImages.has(imageKey);

                return (
                  <div key={index} className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3">
                    {!imageError && partnership.logoUrl && (
                      <img
                        src={partnership.logoUrl}
                        alt={partnership.name}
                        className="w-12 h-12 object-contain flex-shrink-0"
                        onError={() => handleImageError(imageKey)}
                      />
                    )}
                    <div className="flex-1">
                      <div className="text-base font-semibold text-background">{partnership.name}</div>
                      <div className="text-xs text-background/80 font-light max-w-xs">
                        {partnership.description}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-background/70">Pronto anunciaremos nuestras alianzas estratégicas.</p>
            )}
          </div>
        </div>

        <hr className="border-t border-gray-400/30" />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1 space-y-4 flex flex-col items-center text-center md:items-start md:text-left">
            <div className="flex items-center gap-3">
              {!failedImages.has('company-logo') && identity?.urlLogo && (
                <img
                  src={identity.urlLogo}
                  alt="Logo Plataforma Inmobiliaria"
                  className="w-10 h-10 object-contain flex-shrink-0"
                  onError={() => handleImageError('company-logo')}
                />
              )}
              <div className="flex-1">
                <h4 className="text-base font-semibold text-background">
                  {identity?.name || 'Plataforma Inmobiliaria'}
                </h4>
              </div>
            </div>

            <div className="space-y-2 text-xs text-background/80 flex flex-col items-center md:items-start">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-background mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed">
                  {identity?.address || '572 Francesca Stream, Parral, Región del Maule'}
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Phone size={16} className="text-background mt-0.5 flex-shrink-0" />
                <p>{identity?.phone || '+56 9 1429 0441'}</p>
              </div>

              <div className="flex items-start gap-2">
                <Clock size={16} className="text-background mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed whitespace-pre-line">
                  {identity?.businessHours || 'Lunes a Viernes: 9:00 - 18:00\nSábado: 9:00 - 13:00\nDomingo: Cerrado'}
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-1 text-center">
            <h3 className="text-lg font-semibold text-background">Menu</h3>
            <ul className="mt-4 space-y-2">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-background hover:text-primary transition-colors font-light"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-1 space-y-4 flex flex-col items-center text-center md:items-start md:text-left">
            <h3 className="text-lg font-semibold text-background">Contacto</h3>
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-background" />
              <a
                href={`mailto:${identity?.mail || 'contacto@plataformainmobiliaria.cl'}`}
                className="text-sm text-background/90 hover:text-primary transition-colors"
              >
                {identity?.mail || 'contacto@plataformainmobiliaria.cl'}
              </a>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-background">
                <button
                  type="button"
                  onClick={() => setFaqDialogOpen(true)}
                  className="w-full text-center md:text-left hover:text-primary transition-colors"
                >
                  FAQs
                </button>
              </h3>
            </div>
          </div>

          <div className="md:col-span-1 space-y-4 flex flex-col items-center text-center">
            <h3 className="text-lg font-semibold text-background">Síguenos en redes sociales</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {identity?.socialMedia?.instagram?.available && (
                <a
                  href={identity.socialMedia.instagram.url || '#'}
                  aria-label="Instagram"
                  className="text-background hover:text-primary text-4xl"
                >
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
              )}
              {identity?.socialMedia?.facebook?.available && (
                <a
                  href={identity.socialMedia.facebook.url || '#'}
                  aria-label="Facebook"
                  className="text-background hover:text-primary text-4xl"
                >
                  <FontAwesomeIcon icon={faFacebook} />
                </a>
              )}
              {identity?.socialMedia?.linkedin?.available && (
                <a
                  href={identity.socialMedia.linkedin.url || '#'}
                  aria-label="LinkedIn"
                  className="text-background hover:text-primary text-4xl"
                >
                  <FontAwesomeIcon icon={faLinkedin} />
                </a>
              )}
              {identity?.socialMedia?.youtube?.available && (
                <a
                  href={identity.socialMedia.youtube.url || '#'}
                  aria-label="YouTube"
                  className="text-background hover:text-primary text-4xl"
                >
                  <FontAwesomeIcon icon={faYoutube} />
                </a>
              )}
              {(!identity?.socialMedia ||
                (!identity.socialMedia.instagram?.available &&
                  !identity.socialMedia.facebook?.available &&
                  !identity.socialMedia.linkedin?.available &&
                  !identity.socialMedia.youtube?.available)) && (
                <p className="text-sm text-background/70">Pronto estaremos en redes sociales.</p>
              )}
            </div>
          </div>
        </div>

        <div className="text-center text-sm font-extralight text-background border-t border-gray-400/30 pt-4">
          &copy; 2026 EstateFlow. Todos los derechos reservados.
        </div>
      </div>

      <Dialog
        open={faqDialogOpen}
        onClose={() => setFaqDialogOpen(false)}
        title="Preguntas frecuentes"
        size="md"
        closeButtonText="Cerrar"
        actions={(
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setFaqDialogOpen(false)}>
              Cerrar
            </Button>
          </div>
        )}
      >
        <div className="space-y-4">
          {faqs.length > 0 ? (
            faqs.map((faq, index) => (
              <div key={index} className="border-l-4 border-primary pl-4">
                <h4 className="text-base font-semibold text-foreground mb-2">{faq.question}</h4>
                <p className="text-sm text-foreground/80 leading-relaxed">{faq.answer}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-foreground/80">No hay preguntas frecuentes disponibles por el momento.</p>
          )}
        </div>
      </Dialog>
    </footer>
  );
};


export default PortalFooter;
