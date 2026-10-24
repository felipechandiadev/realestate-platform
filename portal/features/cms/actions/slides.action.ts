'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { env } from '@/lib/env'

// Types
export interface Slide {
  id: string;
  title?: string | null;
  description?: string;
  multimediaUrl?: string;
  /** Optional optimized variants when slide media went through media-optimization */
  variants?: Array<{
    variantType: string;
    format?: string;
    url?: string;
  }>;
  linkUrl?: string | null;
  duration?: number;
  startDate?: string;
  endDate?: string;
  order: number;
  isActive: boolean;
  ctaLabel?: string | null;
  ctaStyle?: 'none' | 'button' | 'link' | null;
  textAlign?: 'left' | 'center' | 'right' | null;
  overlayOpacity?: number | null;
  textColor?: string | null;
  ctaButtonBgColor?: string | null;
  ctaButtonTextColor?: string | null;
  ctaLinkColor?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSlideDto {
  title: string;
  description?: string;
  linkUrl?: string;
  isActive?: boolean;
  order?: number;
}

export interface GetSlidesParams {
  search?: string;
}

export async function getPublicSlides(): Promise<{
  success: boolean;
  data?: Slide[];
  autoplaySeconds?: number;
  error?: string;
}> {
  try {
    const res = await fetch(`${env.backendApiUrl}/slide/public/active`, {
      headers: { 
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      return { 
        success: false, 
        error: errorData?.message || `HTTP ${res.status}` 
      }
    }

    const payload = await res.json()
    if (Array.isArray(payload)) {
      return { success: true, data: payload, autoplaySeconds: 6 }
    }
    const seconds = Number(payload?.autoplaySeconds)
    return {
      success: true,
      data: Array.isArray(payload?.slides) ? payload.slides : [],
      autoplaySeconds: Number.isFinite(seconds) ? Math.max(3, Math.round(seconds)) : 6,
    }
  } catch (error) {
    console.error('Error fetching public slides:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}