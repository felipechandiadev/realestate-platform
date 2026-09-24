'use client';

import { Phone } from 'lucide-react';

export interface PhoneIconProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Phone icon component using Lucide React
 */
export function PhoneIcon({ className = '', style }: PhoneIconProps) {
  return (
    <Phone 
      className={`inline-block ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * SVG fallback version if Lucide fails to load
 */
export function PhoneIconSVG({ className = '', style }: PhoneIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`inline-block ${className}`}
      style={style}
      fill="currentColor"
    >
      <path d="M17.464 12.556h-.97v-1.565h.97V8.523H7.533v2.468h.971v1.565h-.971v2.469h9.931v-2.469zm-3.902 1.565h-2.124v-1.565h2.124v1.565z" />
      <path d="M19.5 2h-15C3.12 2 2 3.12 2 4.5v15C2 20.88 3.12 22 4.5 22h15c1.38 0 2.5-1.12 2.5-2.5v-15C22 3.12 20.88 2 19.5 2zm-5 19h-5v-1h5v1zm5-2h-15v-13h15v13z" />
    </svg>
  );
}
