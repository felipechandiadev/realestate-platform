import * as Icons from "lucide-react";
import type { ComponentType } from "react";
import { ICON_MAP } from "./iconMap";

export type LucideIconName = keyof typeof Icons;
export type IconName = LucideIconName | (string & {});

const FALLBACK_ICON: LucideIconName = "HelpCircle";

function isLucideIconName(name: string): name is LucideIconName {
  return name in Icons;
}

/**
 * Resuelve un nombre de icono Material/legacy o Lucide al componente Lucide correspondiente.
 */
export function resolveLucideIconName(icon: string): LucideIconName {
  if (!icon) {
    return FALLBACK_ICON;
  }

  if (isLucideIconName(icon)) {
    return icon;
  }

  const mapped = ICON_MAP[icon];
  if (mapped && isLucideIconName(mapped)) {
    return mapped;
  }

  return FALLBACK_ICON;
}

export function resolveLucideIconComponent(
  icon: string,
): ComponentType<{ size?: number; strokeWidth?: number; className?: string }> {
  const resolved = resolveLucideIconName(icon);
  const IconComponent = Icons[resolved] as ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;

  if (!IconComponent) {
    return Icons[FALLBACK_ICON] as ComponentType<{
      size?: number;
      strokeWidth?: number;
      className?: string;
    }>;
  }

  return IconComponent;
}

export function shouldWarnMissingIcon(icon: string, resolved: LucideIconName): boolean {
  if (!icon || resolved !== FALLBACK_ICON) {
    return false;
  }

  if (icon === "help" || icon === "help_outline" || icon === "HelpCircle") {
    return false;
  }

  return !isLucideIconName(icon) && !(icon in ICON_MAP);
}
