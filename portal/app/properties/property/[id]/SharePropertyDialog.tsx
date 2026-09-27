'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@realestate/ui';
import { Button } from '@realestate/ui';
import { Copy, Facebook, Share2 } from 'lucide-react';
import { useAlert } from '@/shared/hooks/useAlert';
import { facebookShareHref, propertyPublicPath, whatsappShareHref } from './share-links';

type SharePropertyDialogProps = {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  title: string;
};

export default function SharePropertyDialog({
  open,
  onClose,
  propertyId,
  title,
}: SharePropertyDialogProps) {
  const { showAlert } = useAlert();
  const [canUseNativeShare, setCanUseNativeShare] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    setCanUseNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
    setShareUrl(`${window.location.origin}${propertyPublicPath(propertyId)}`);
  }, [propertyId]);

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showAlert({ message: 'Enlace copiado', type: 'success', duration: 2000 });
    } catch {
      showAlert({ message: 'No se pudo copiar el enlace', type: 'error', duration: 2500 });
    }
  };

  const shareNative = async () => {
    if (!shareUrl || !navigator.share) return;
    try {
      await navigator.share({ title, text: title, url: shareUrl });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      showAlert({ message: 'No se pudo abrir el menú de compartir', type: 'error', duration: 2500 });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Compartir propiedad"
      size="sm"
      hideActions
      data-test-id="sharePropertyDialog"
    >
      <div className="flex flex-col gap-3 pb-2">
        <Button type="button" variant="outlined" className="w-full" onClick={copyLink} data-test-id="sharePropertyCopy">
          <Copy size={16} />
          Copiar enlace
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            if (!shareUrl) return;
            window.open(whatsappShareHref(title, shareUrl), '_blank', 'noopener,noreferrer');
          }}
          className="w-full"
          data-test-id="sharePropertyWhatsapp"
        >
          WhatsApp
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={() => {
            if (!shareUrl) return;
            window.open(facebookShareHref(shareUrl), '_blank', 'noopener,noreferrer');
          }}
          className="w-full"
          data-test-id="sharePropertyFacebook"
        >
          <Facebook size={16} />
          Facebook
        </Button>
        {canUseNativeShare ? (
          <Button type="button" variant="text" onClick={shareNative} data-test-id="sharePropertyMore">
            <Share2 size={16} />
            Más
          </Button>
        ) : null}
      </div>
    </Dialog>
  );
}
