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
import { getIdentity } from "@/features/cms/actions/identity.action";
import { Dialog } from "@realestate/ui";
import { Button } from "@realestate/ui";
import { FALLBACK_PORTAL_FOOTER, type PortalFooterConfig } from "./portal-footer";

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
  name?: string;
  address: string;
  phone: string;
  mail: string;
  businessHours: string;
  urlLogo?: string;
  socialMedia?: SocialMedia;
  partnerships?: Partnership[];
  faqs?: FAQItem[];
}

const PortalFooter: React.FC<{
  initialIdentity?: Identity | Record<string, unknown> | null;
  config?: PortalFooterConfig | null;
}> = ({ initialIdentity = null, config = null }) => {
  const footer = config ?? FALLBACK_PORTAL_FOOTER;
  const seeded = initialIdentity && typeof initialIdentity === 'object' ? (initialIdentity as Identity) : null;
  const [identity, setIdentity] = useState<Identity | null>(seeded);
  const [loading, setLoading] = useState(!seeded);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);

  useEffect(() => {
    if (seeded) return;
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
  }, [seeded]);

  if (loading) {
    return (
      <footer
        className="p-8 mt-12 border-t border-border"
        style={{ backgroundColor: 'var(--color-footer-background)', color: 'var(--color-footer-foreground)' }}
      >
        <div className="container mx-auto text-center">
          <div className="text-inherit">Cargando...</div>
        </div>
      </footer>
    );
  }

  const handleImageError = (imageKey: string) => {
    setFailedImages(prev => new Set([...prev, imageKey]));
  };

  const partnerships = identity?.partnerships ?? [];
  const faqs = identity?.faqs ?? [];
  const menuItems = footer.menuItems.filter((item) => item.enabled !== false);
  const showPartnerships = footer.showPartnerships && partnerships.length > 0;
  const companyName = identity?.name?.trim() || '';
  const address = footer.showAddress ? identity?.address?.trim() || '' : '';
  const phone = footer.showPhone ? identity?.phone?.trim() || '' : '';
  const hours = footer.showHours ? identity?.businessHours?.trim() || '' : '';
  const mail = footer.showMail ? identity?.mail?.trim() || '' : '';
  const logoSrc = footer.logoUrl?.trim() || identity?.urlLogo?.trim() || '';
  const showCompany = footer.showCompany && Boolean(logoSrc || companyName || address || phone || hours);
  const showContact = Boolean(mail) || footer.showFaqs;

  return (
    <footer
      className="p-8 mt-12 border-t border-border"
      style={{ backgroundColor: 'var(--color-footer-background)', color: 'var(--color-footer-foreground)' }}
    >
      <div className="container mx-auto flex flex-col gap-10">
        {showPartnerships && (
        <div className="flex flex-col gap-6">
          <h3 className="text-lg font-semibold text-inherit text-center">{footer.partnershipsTitle}</h3>
          <div className="flex flex-wrap gap-6 justify-center">
              {partnerships.map((partnership, index) => {
                const imageKey = `partnership-${index}`;
                const imageError = failedImages.has(imageKey);

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg px-4 py-3"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--color-footer-foreground) 5%, transparent)' }}
                  >
                    {!imageError && partnership.logoUrl && (
                      <img
                        src={partnership.logoUrl}
                        alt={partnership.name}
                        className="w-12 h-12 object-contain flex-shrink-0"
                        onError={() => handleImageError(imageKey)}
                      />
                    )}
                    <div className="flex-1">
                      <div className="text-base font-semibold text-inherit">{partnership.name}</div>
                      <div className="text-xs text-inherit opacity-80 font-light max-w-xs">
                        {partnership.description}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        )}

        {showPartnerships && <hr className="border-t border-current/30" />}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {showCompany ? (
          <div className="md:col-span-1 space-y-4 flex flex-col items-center text-center md:items-start md:text-left">
            <div className="flex items-center gap-3">
              {!failedImages.has('company-logo') && logoSrc ? (
                <img
                  src={logoSrc}
                  alt={companyName ? `Logo de ${companyName}` : 'Logo'}
                  className="w-10 h-10 object-contain flex-shrink-0"
                  onError={() => handleImageError('company-logo')}
                />
              ) : null}
              {companyName ? (
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-inherit">{companyName}</h4>
                </div>
              ) : null}
            </div>

            {(address || phone || hours) ? (
            <div className="space-y-2 text-xs text-inherit opacity-80 flex flex-col items-center md:items-start">
              {address ? (
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-inherit mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed">{address}</p>
              </div>
              ) : null}
              {phone ? (
              <div className="flex items-start gap-2">
                <Phone size={16} className="text-inherit mt-0.5 flex-shrink-0" />
                <p>{phone}</p>
              </div>
              ) : null}
              {hours ? (
              <div className="flex items-start gap-2">
                <Clock size={16} className="text-inherit mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed whitespace-pre-line">{hours}</p>
              </div>
              ) : null}
            </div>
            ) : null}
          </div>
          ) : null}

          {menuItems.length > 0 ? (
          <div className="md:col-span-1 text-center">
            <h3 className="text-lg font-semibold text-inherit">{footer.menuTitle}</h3>
            <ul className="mt-4 space-y-2">
              {menuItems.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    className="text-sm text-inherit hover:text-primary transition-colors font-light"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          ) : null}

          {showContact ? (
          <div className="md:col-span-1 space-y-4 flex flex-col items-center text-center md:items-start md:text-left">
            {mail ? (
            <>
            <h3 className="text-lg font-semibold text-inherit">{footer.contactTitle}</h3>
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-inherit" />
              <a
                href={`mailto:${mail}`}
                className="text-sm text-inherit opacity-90 hover:opacity-100 hover:text-primary transition-colors"
              >
                {mail}
              </a>
            </div>
            </>
            ) : null}

            {footer.showFaqs && faqs.length > 0 ? (
            <div className={mail ? 'mt-8' : ''}>
              <h3 className="text-lg font-semibold text-inherit">
                <button
                  type="button"
                  onClick={() => setFaqDialogOpen(true)}
                  className="w-full text-center md:text-left hover:text-primary transition-colors"
                >
                  {footer.faqsTitle}
                </button>
              </h3>
            </div>
            ) : null}
          </div>
          ) : null}

          {footer.showSocial ? (
          <div className="md:col-span-1 space-y-4 flex flex-col items-center text-center">
            <h3 className="text-lg font-semibold text-inherit">{footer.socialTitle}</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {identity?.socialMedia?.instagram?.available && (
                <a
                  href={identity.socialMedia.instagram.url || '#'}
                  aria-label="Instagram"
                  className="text-inherit hover:text-primary text-4xl"
                >
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
              )}
              {identity?.socialMedia?.facebook?.available && (
                <a
                  href={identity.socialMedia.facebook.url || '#'}
                  aria-label="Facebook"
                  className="text-inherit hover:text-primary text-4xl"
                >
                  <FontAwesomeIcon icon={faFacebook} />
                </a>
              )}
              {identity?.socialMedia?.linkedin?.available && (
                <a
                  href={identity.socialMedia.linkedin.url || '#'}
                  aria-label="LinkedIn"
                  className="text-inherit hover:text-primary text-4xl"
                >
                  <FontAwesomeIcon icon={faLinkedin} />
                </a>
              )}
              {identity?.socialMedia?.youtube?.available && (
                <a
                  href={identity.socialMedia.youtube.url || '#'}
                  aria-label="YouTube"
                  className="text-inherit hover:text-primary text-4xl"
                >
                  <FontAwesomeIcon icon={faYoutube} />
                </a>
              )}
              {(!identity?.socialMedia ||
                (!identity.socialMedia.instagram?.available &&
                  !identity.socialMedia.facebook?.available &&
                  !identity.socialMedia.linkedin?.available &&
                  !identity.socialMedia.youtube?.available)) && (
                <p className="text-sm text-inherit opacity-70">Pronto estaremos en redes sociales.</p>
              )}
            </div>
          </div>
          ) : null}
        </div>

        {footer.showCopyright ? (
        <div className="text-center text-sm font-extralight text-inherit border-t border-current/30 pt-4">
          &copy; {new Date().getFullYear()}{companyName ? ` ${companyName}` : ''}. {footer.copyrightSuffix}
        </div>
        ) : null}
      </div>

      <Dialog
        open={faqDialogOpen}
        onClose={() => setFaqDialogOpen(false)}
        title={footer.faqsTitle || 'Preguntas frecuentes'}
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
