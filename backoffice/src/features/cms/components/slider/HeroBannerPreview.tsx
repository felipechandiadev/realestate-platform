'use client';

import type { Slide } from '@/features/cms/actions/slides.action';

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

type Align = 'left' | 'center' | 'right';

const ALIGN_CLASS: Record<Align, string> = {
  left: 'items-start text-left',
  center: 'items-center text-center mx-auto',
  right: 'items-end text-right ml-auto',
};

function normalizeHex(value?: string | null): string | null {
  const trimmed = value?.trim() ?? '';
  return HEX_COLOR.test(trimmed) ? trimmed : null;
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

export type HeroPreviewModel = Pick<
  Slide,
  | 'title'
  | 'description'
  | 'linkUrl'
  | 'ctaLabel'
  | 'ctaStyle'
  | 'textAlign'
  | 'overlayOpacity'
  | 'textColor'
  | 'ctaButtonBgColor'
  | 'ctaButtonTextColor'
  | 'ctaLinkColor'
> & {
  multimediaUrl?: string | null;
};

function resolveCta(slide: HeroPreviewModel): { style: 'button' | 'link'; label: string; href: string } | null {
  const href = slide.linkUrl?.trim() || '';
  const label = slide.ctaLabel?.trim() || '';
  if (slide.ctaStyle === 'button' || slide.ctaStyle === 'link') {
    if (!label) return null;
    return { style: slide.ctaStyle, label, href: href || '/' };
  }
  if (href && !label) return { style: 'button', label: 'Ver más', href };
  return null;
}

export function HeroBannerPreview({
  slide,
  mediaUrl,
  className = '',
}: {
  slide: HeroPreviewModel;
  mediaUrl?: string | null;
  className?: string;
}) {
  const align = ALIGN_CLASS[(slide.textAlign as Align) || 'left'] ?? ALIGN_CLASS.left;
  const textColor = normalizeHex(slide.textColor);
  const textStyle = textColor
    ? { color: textColor }
    : { color: '#ffffff', textShadow: '2px 2px 8px #000, 0 0 2px #000' };
  const overlay = Math.min(90, Math.max(0, Number(slide.overlayOpacity ?? 45)));
  const media = (mediaUrl ?? slide.multimediaUrl)?.trim() || '';
  const cta = resolveCta(slide);

  return (
    <div className={`relative min-h-[200px] w-full overflow-hidden md:min-h-[260px] ${className}`.trim()}>
      {media && isVideoUrl(media) ? (
        <video
          src={media}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          autoPlay
          loop
          playsInline
        />
      ) : media ? (
        <img src={media} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-neutral-200" />
      )}
      {overlay > 0 ? <div className="absolute inset-0 bg-black" style={{ opacity: overlay / 100 }} /> : null}
      <div className="relative z-10 flex min-h-[200px] flex-col justify-end px-6 pb-14 pt-12 md:min-h-[260px] md:px-10">
        <div className={`flex w-full max-w-2xl flex-col ${align}`}>
          {slide.title ? (
            <h2 className="text-xl font-bold tracking-tight md:text-3xl" style={textStyle}>
              {slide.title}
            </h2>
          ) : (
            <p className="text-sm italic text-white/80">Sin título</p>
          )}
          {slide.description ? (
            <p className="mt-2 whitespace-pre-line text-sm md:text-base" style={textStyle}>
              {slide.description}
            </p>
          ) : null}
          {cta ? (
            cta.style === 'link' ? (
              <span
                className="mt-4 inline-block text-sm font-medium underline underline-offset-4"
                style={{ color: normalizeHex(slide.ctaLinkColor) || textColor || '#ffffff' }}
              >
                {cta.label}
              </span>
            ) : (
              <span
                className={`mt-4 inline-flex min-h-9 items-center rounded-lg px-4 py-2 text-xs font-semibold ${
                  normalizeHex(slide.ctaButtonBgColor) ? '' : 'bg-primary text-white'
                }`}
                style={{
                  ...(normalizeHex(slide.ctaButtonBgColor) ? { backgroundColor: normalizeHex(slide.ctaButtonBgColor)! } : {}),
                  ...(normalizeHex(slide.ctaButtonTextColor) ? { color: normalizeHex(slide.ctaButtonTextColor)! } : {}),
                }}
              >
                {cta.label}
              </span>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
