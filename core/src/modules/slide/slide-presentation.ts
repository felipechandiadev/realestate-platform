const CTA_STYLES = ['none', 'button', 'link'] as const;
const TEXT_ALIGNS = ['left', 'center', 'right'] as const;
const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;
const COLOR_KEYS = ['textColor', 'ctaButtonBgColor', 'ctaButtonTextColor', 'ctaLinkColor'] as const;

/** Normalizes form strings before they are written on a slide row. */
export function normalizeSlideInput(dto: Record<string, unknown>): void {
  if (dto.title !== undefined) {
    const title = typeof dto.title === 'string' ? dto.title.trim() : dto.title;
    dto.title = title ? title : null;
  }

  if (dto.linkUrl !== undefined) {
    const link = typeof dto.linkUrl === 'string' ? dto.linkUrl.trim() : dto.linkUrl;
    dto.linkUrl = link ? link : null;
  }

  if (dto.ctaLabel !== undefined) {
    const label = typeof dto.ctaLabel === 'string' ? dto.ctaLabel.trim() : dto.ctaLabel;
    dto.ctaLabel = label ? label : null;
  }

  if (dto.ctaStyle !== undefined && dto.ctaStyle !== null && dto.ctaStyle !== '') {
    dto.ctaStyle = (CTA_STYLES as readonly unknown[]).includes(dto.ctaStyle) ? dto.ctaStyle : 'none';
  }

  if (dto.textAlign !== undefined && dto.textAlign !== null && dto.textAlign !== '') {
    dto.textAlign = (TEXT_ALIGNS as readonly unknown[]).includes(dto.textAlign) ? dto.textAlign : 'left';
  }

  if (dto.overlayOpacity !== undefined && dto.overlayOpacity !== null && dto.overlayOpacity !== '') {
    const parsed = Math.round(Number(dto.overlayOpacity));
    dto.overlayOpacity = Number.isFinite(parsed) ? Math.min(90, Math.max(0, parsed)) : 45;
  }

  for (const key of COLOR_KEYS) {
    if (dto[key] === undefined) continue;
    const raw = typeof dto[key] === 'string' ? dto[key].trim() : dto[key];
    dto[key] = typeof raw === 'string' && HEX_COLOR.test(raw) ? raw : null;
  }
}

export function clampHeroAutoplaySeconds(value: unknown): number {
  const parsed = Math.round(Number(value));
  if (!Number.isFinite(parsed)) return 6;
  return Math.max(3, parsed);
}
