import { env } from '@/lib/env';
import {
  DEFAULT_APPEARANCE,
  resolveAppearance,
  type AppearanceColors,
} from '@realestate/ui/theme/appearance-theme';

export async function getAppearance(): Promise<AppearanceColors> {
  try {
    const res = await fetch(`${env.backendApiUrl}/appearance`, {
      next: { revalidate: 300, tags: ['appearance'] },
    });
    if (!res.ok) return DEFAULT_APPEARANCE;
    const data = (await res.json()) as Partial<AppearanceColors>;
    return resolveAppearance(data);
  } catch (err) {
    console.warn('[getAppearance] fetch failed:', err);
    return DEFAULT_APPEARANCE;
  }
}
