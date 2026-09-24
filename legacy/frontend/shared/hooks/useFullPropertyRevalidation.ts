'use client'

import { useTransition } from 'react'
import { usePathname } from 'next/navigation'
import { revalidatePropertyRoute } from '@/features/backoffice/properties/actions/properties.action'

/**
 * Hook para revalidar la ruta actual después de cambios en propiedades
 * 
 * Uso típico en componentes que abren FullPropertyDialog:
 * ```tsx
 * const { revalidate, isPending } = useFullPropertyRevalidation();
 * 
 * const handleClose = async () => {
 *   setOpenDialogs(prev => ({ ...prev, [id]: false }));
 *   await revalidate();
 * };
 * ```
 * 
 * Parámetro opcional:
 * ```tsx
 * // Revalidar ruta específica en lugar de la actual
 * const { revalidate } = useFullPropertyRevalidation('/backOffice/properties/sales');
 * ```
 * 
 * @param pathOverride - Ruta específica a revalidar (opcional). Si no se proporciona, revalida la ruta actual.
 * @returns { revalidate, isPending } - Función para revalidar y estado de carga
 */
export function useFullPropertyRevalidation(pathOverride?: string) {
  const [isPending, startTransition] = useTransition()
  const pathname = usePathname()

  const revalidate = async () => {
    const pathToRevalidate = pathOverride || pathname
    
    startTransition(async () => {
      try {
        await revalidatePropertyRoute(pathToRevalidate)
      } catch (error) {
        console.error('Error revalidating property route:', error)
      }
    })
  }

  return {
    revalidate,
    isPending,
  }
}
