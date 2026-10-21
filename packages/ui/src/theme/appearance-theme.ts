import type { CSSProperties } from 'react';

export type AppearanceColors = {
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  accent: string;
  topBarBackground: string;
  topBarForeground: string;
  navbarBackground: string;
  navbarForeground: string;
  footerBackground: string;
  footerForeground: string;
};

export const DEFAULT_APPEARANCE: AppearanceColors = {
  primary: '#1e73ae',
  secondary: '#00deef',
  background: '#ffffff',
  foreground: '#131615',
  accent: '#02578b',
  topBarBackground: '#ffffff',
  topBarForeground: '#131615',
  navbarBackground: '#ffffff',
  navbarForeground: '#131615',
  footerBackground: '#131615',
  footerForeground: '#ffffff',
};

export const APPEARANCE_COLOR_KEYS = [
  'primary',
  'secondary',
  'background',
  'foreground',
  'accent',
  'topBarBackground',
  'topBarForeground',
  'navbarBackground',
  'navbarForeground',
  'footerBackground',
  'footerForeground',
] as const;

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim();
  if (!HEX.test(trimmed)) return null;
  const body = trimmed.slice(1);
  const full = body.length === 3 ? body.split('').map((char) => char + char).join('') : body;
  return `#${full.toLowerCase()}`;
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (channel: number) => Math.max(0, Math.min(255, Math.round(channel)));
  return `#${[r, g, b].map((channel) => clamp(channel).toString(16).padStart(2, '0')).join('')}`;
}

function mix(base: string, other: string, weight: number): string {
  const [br, bg, bb] = hexToRgb(base);
  const [or, og, ob] = hexToRgb(other);
  return rgbToHex(
    br * weight + or * (1 - weight),
    bg * weight + og * (1 - weight),
    bb * weight + ob * (1 - weight),
  );
}

function darken(hex: string, amount: number): string {
  return mix(hex, '#000000', 1 - amount);
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const scaled = channel / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function textOnColor(hex: string): string {
  return relativeLuminance(hex) > 0.55 ? '#131615' : '#ffffff';
}

export function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

export function appearanceContrastWarnings(colors: AppearanceColors): {
  label: string;
  ratio: number;
}[] {
  const pairs: { label: string; foreground: string; background: string }[] = [
    { label: 'Aplicación', foreground: colors.foreground, background: colors.background },
    { label: 'Barra superior', foreground: colors.topBarForeground, background: colors.topBarBackground },
    { label: 'Navbar', foreground: colors.navbarForeground, background: colors.navbarBackground },
    { label: 'Footer', foreground: colors.footerForeground, background: colors.footerBackground },
    { label: 'Enlaces de la navbar (hover)', foreground: colors.primary, background: colors.navbarBackground },
    { label: 'Enlaces del footer (hover)', foreground: colors.primary, background: colors.footerBackground },
  ];
  return pairs
    .map(({ label, foreground, background }) => ({ label, ratio: contrastRatio(foreground, background) }))
    .filter(({ ratio }) => ratio < 4.5);
}

export function resolveAppearance(
  input?: Partial<AppearanceColors> | null,
): AppearanceColors {
  const pick = (key: keyof AppearanceColors) => {
    const raw = input?.[key];
    if (typeof raw !== 'string') return DEFAULT_APPEARANCE[key];
    return normalizeHexColor(raw) ?? DEFAULT_APPEARANCE[key];
  };
  return {
    primary: pick('primary'),
    secondary: pick('secondary'),
    background: pick('background'),
    foreground: pick('foreground'),
    accent: pick('accent'),
    topBarBackground: pick('topBarBackground'),
    topBarForeground: pick('topBarForeground'),
    navbarBackground: pick('navbarBackground'),
    navbarForeground: pick('navbarForeground'),
    footerBackground: pick('footerBackground'),
    footerForeground: pick('footerForeground'),
  };
}

export type AppearanceCssVars = Record<`--color-${string}`, string>;

function channels(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `${r} ${g} ${b}`;
}

export function buildAppearanceCssVars(colors: AppearanceColors): AppearanceCssVars {
  const active = darken(colors.primary, 0.18);
  const border = mix(colors.secondary, colors.background, 0.35);
  const muted = mix(colors.secondary, colors.background, 0.22);
  const mutedForeground = mix(colors.foreground, colors.background, 0.55);
  const surface = mix(colors.background, colors.secondary, 0.94);
  const vars: AppearanceCssVars = {};

  const set = (name: string, hex: string) => {
    vars[`--color-${name}`] = hex;
    vars[`--color-${name}-rgb`] = channels(hex);
  };

  set('primary', colors.primary);
  set('secondary', colors.secondary);
  set('background', colors.background);
  set('foreground', colors.foreground);
  set('accent', colors.accent);
  set('topbar-background', colors.topBarBackground);
  set('topbar-foreground', colors.topBarForeground);
  set('navbar-background', colors.navbarBackground);
  set('navbar-foreground', colors.navbarForeground);
  set('footer-background', colors.footerBackground);
  set('footer-foreground', colors.footerForeground);
  set('active', active);
  set('info', colors.primary);
  set('border', border);
  set('muted', muted);
  set('muted-foreground', mutedForeground);
  set('surface', surface);
  vars['--color-link'] = colors.primary;
  vars['--color-text-primary'] = colors.foreground;
  vars['--color-text-link'] = colors.primary;
  vars['--color-text-on-primary'] = textOnColor(colors.primary);
  return vars;
}

export function appearanceStyle(colors: AppearanceColors): CSSProperties {
  return buildAppearanceCssVars(colors) as CSSProperties;
}
