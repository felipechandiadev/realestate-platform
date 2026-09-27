'use client';

import { useEffect, useState } from 'react';
import { Button, TextField } from '@realestate/ui';
import { Copy, Facebook } from 'lucide-react';
import { useAlert } from '@/shared/hooks/useAlert';
import { sharePropertyByEmail } from '@/features/properties/actions/share-property.action';
import {
  facebookShareHref,
  propertyPublicUrl,
  whatsappShareHref,
} from '@/features/properties/utils/property-public-url';

type SharePropertySectionProps = {
  propertyId: string;
  propertyTitle: string;
  status?: string | null;
};

export function SharePropertySection({
  propertyId,
  propertyTitle,
  status,
}: SharePropertySectionProps) {
  const { showAlert } = useAlert();
  const publicUrl = propertyPublicUrl(propertyId);
  const canEmail = status === 'PUBLISHED';
  const [qrSrc, setQrSrc] = useState('');
  const [to, setTo] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import('qrcode')
      .then((QRCode) => QRCode.toDataURL(publicUrl, { margin: 1, width: 180 }))
      .then((dataUrl) => {
        if (!cancelled) setQrSrc(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setQrSrc('');
      });
    return () => {
      cancelled = true;
    };
  }, [publicUrl]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      showAlert({ message: 'Enlace copiado', type: 'success', duration: 2000 });
    } catch {
      showAlert({ message: 'No se pudo copiar el enlace', type: 'error', duration: 2500 });
    }
  };

  const sendEmail = async () => {
    if (!canEmail || sending) return;
    setSending(true);
    try {
      const result = await sharePropertyByEmail(propertyId, to, note);
      if (result.success) {
        showAlert({ message: 'Correo enviado', type: 'success', duration: 3000 });
        setTo('');
        setNote('');
      } else {
        showAlert({
          message: result.error || 'No se pudo enviar el correo',
          type: 'error',
          duration: 3500,
        });
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="space-y-6" data-test-id="property-share-section">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Compartir
        </p>
        <p className="text-sm text-muted-foreground">
          Este enlace abre la ficha pública del portal.
        </p>
      </header>

      <div className="space-y-3">
        <p className="break-all rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
          {publicUrl}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outlined" onClick={copyLink} data-test-id="property-share-copy">
            <Copy size={16} />
            Copiar enlace
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => window.open(whatsappShareHref(propertyTitle, publicUrl), '_blank', 'noopener,noreferrer')}
            data-test-id="property-share-whatsapp"
          >
            WhatsApp
          </Button>
          <Button
            type="button"
            variant="outlined"
            onClick={() => window.open(facebookShareHref(publicUrl), '_blank', 'noopener,noreferrer')}
            data-test-id="property-share-facebook"
          >
            <Facebook size={16} />
            Facebook
          </Button>
        </div>
      </div>

      {qrSrc ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Código QR</p>
          <img src={qrSrc} alt="Código QR de la ficha pública" width={180} height={180} />
        </div>
      ) : null}

      <div className="space-y-4 border-t border-border pt-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Correo</p>
          <p className="text-sm text-muted-foreground">
            Se envía con la plantilla de la inmobiliaria, con foto, precio y el enlace de la ficha.
          </p>
        </div>
        {canEmail ? (
          <div className="space-y-4">
            <TextField
              label="Correo del destinatario"
              type="email"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="w-full"
              data-test-id="property-share-email"
            />
            <TextField
              label="Nota"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              className="w-full"
              data-test-id="property-share-note"
            />
            <Button
              type="button"
              variant="primary"
              loading={sending}
              disabled={sending || !to.trim()}
              onClick={sendEmail}
              data-test-id="property-share-send"
            >
              Enviar correo
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground" data-test-id="property-share-email-disabled">
            El correo se habilita cuando la propiedad está publicada.
          </p>
        )}
      </div>
    </section>
  );
}
